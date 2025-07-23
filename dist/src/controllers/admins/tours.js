"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTour = exports.getTourById = exports.getAllTours = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const generateSchedules_1 = require("../../utils/generateSchedules");
const handleImages_1 = require("../../utils/handleImages");
const uuid_1 = require("uuid");
const getAllTours = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const toursData = yield db_1.db.select().from(schema_1.tours);
    (0, response_1.SuccessResponse)(res, { tours: toursData }, 200);
});
exports.getAllTours = getAllTours;
const getTourById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tourId = Number(req.params.id);
    const [mainTour] = yield db_1.db
        .select({
        id: schema_1.tours.id,
        title: schema_1.tours.title,
        mainImage: schema_1.tours.mainImage,
        description: schema_1.tours.describtion,
        featured: schema_1.tours.featured,
        status: schema_1.tours.status,
        startDate: schema_1.tours.startDate,
        endDate: schema_1.tours.endDate,
        durationDays: schema_1.tours.durationDays,
        durationHours: schema_1.tours.durationHours,
        country: schema_1.tours.country,
        city: schema_1.tours.city,
        maxUsers: schema_1.tours.maxUsers,
        category: schema_1.categories.name,
        price: {
            adult: schema_1.tourPrice.adult,
            child: schema_1.tourPrice.child,
            infant: schema_1.tourPrice.infant,
            currency: schema_1.currencies.name,
        },
    })
        .from(schema_1.tours)
        .leftJoin(schema_1.categories, (0, drizzle_orm_1.eq)(schema_1.tours.categoryId, schema_1.categories.id))
        .leftJoin(schema_1.tourPrice, (0, drizzle_orm_1.eq)(schema_1.tours.id, schema_1.tourPrice.tourId))
        .leftJoin(schema_1.currencies, (0, drizzle_orm_1.eq)(schema_1.tourPrice.currencyId, schema_1.currencies.id))
        .where((0, drizzle_orm_1.eq)(schema_1.tours.id, tourId));
    if (!mainTour)
        throw new Errors_1.NotFound("tour not found");
    const [highlights, includes, excludes, itinerary, faq, discounts, daysOfWeek, extrasWithPrices, images,] = yield Promise.all([
        db_1.db.select().from(schema_1.tourHighlight).where((0, drizzle_orm_1.eq)(schema_1.tourHighlight.tourId, tourId)),
        db_1.db.select().from(schema_1.tourIncludes).where((0, drizzle_orm_1.eq)(schema_1.tourIncludes.tourId, tourId)),
        db_1.db.select().from(schema_1.tourExcludes).where((0, drizzle_orm_1.eq)(schema_1.tourExcludes.tourId, tourId)),
        db_1.db.select().from(schema_1.tourItinerary).where((0, drizzle_orm_1.eq)(schema_1.tourItinerary.tourId, tourId)),
        db_1.db.select().from(schema_1.tourFAQ).where((0, drizzle_orm_1.eq)(schema_1.tourFAQ.tourId, tourId)),
        db_1.db.select().from(schema_1.tourDiscounts).where((0, drizzle_orm_1.eq)(schema_1.tourDiscounts.tourId, tourId)),
        db_1.db
            .select({ dayOfWeek: schema_1.tourDaysOfWeek.dayOfWeek })
            .from(schema_1.tourDaysOfWeek)
            .where((0, drizzle_orm_1.eq)(schema_1.tourDaysOfWeek.tourId, tourId)),
        db_1.db
            .select({
            id: schema_1.extras.id,
            name: schema_1.extras.name,
            price: {
                adult: schema_1.tourPrice.adult,
                child: schema_1.tourPrice.child,
                infant: schema_1.tourPrice.infant,
            },
        })
            .from(schema_1.tourExtras)
            .leftJoin(schema_1.extras, (0, drizzle_orm_1.eq)(schema_1.tourExtras.extraId, schema_1.extras.id))
            .leftJoin(schema_1.tourPrice, (0, drizzle_orm_1.eq)(schema_1.tourExtras.priceId, schema_1.tourPrice.id))
            .where((0, drizzle_orm_1.eq)(schema_1.tourExtras.tourId, tourId)),
        db_1.db
            .select({ imagePath: schema_1.tourImages.imagePath })
            .from(schema_1.tourImages)
            .where((0, drizzle_orm_1.eq)(schema_1.tourImages.tourId, tourId)),
    ]);
    (0, response_1.SuccessResponse)(res, Object.assign(Object.assign({}, mainTour), { highlights: highlights.map((h) => h.content), includes: includes.map((i) => i.content), excludes: excludes.map((e) => e.content), itinerary: itinerary.map((i) => ({
            title: i.title,
            imagePath: i.imagePath,
            description: i.describtion,
        })), faq: faq.map((f) => ({ question: f.question, answer: f.answer })), discounts, daysOfWeek: daysOfWeek.map((d) => d.dayOfWeek), extras: extrasWithPrices, images: images.map((img) => img.imagePath) }), 200);
});
exports.getTourById = getTourById;
const createTour = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const data = req.body;
    const [newTour] = yield db_1.db
        .insert(schema_1.tours)
        .values({
        title: data.title,
        mainImage: yield (0, handleImages_1.saveBase64Image)(data.mainImage, (0, uuid_1.v4)(), req, "tours"),
        categoryId: data.categoryId,
        describtion: data.description,
        status: true,
        featured: (_a = data.featured) !== null && _a !== void 0 ? _a : false,
        meetingPoint: (_b = data.meetingPoint) !== null && _b !== void 0 ? _b : false,
        meetingPointLocation: data.meetingPoint
            ? data.meetingPointLocation
            : null,
        meetingPointAddress: data.meetingPoint ? data.meetingPointAddress : null,
        points: (_c = data.points) !== null && _c !== void 0 ? _c : 0,
        startDate: data.startDate,
        endDate: data.endDate,
        durationDays: data.durationDays,
        durationHours: data.durationHours,
        country: data.country,
        city: data.city,
        maxUsers: data.maxUsers,
    })
        .$returningId();
    const tourId = newTour.id;
    // Insert related content if provided
    if (data.prices && data.prices.length > 0) {
        yield db_1.db.insert(schema_1.tourPrice).values(data.prices.map((price) => ({
            adult: price.adult,
            child: price.child,
            infant: price.infant,
            currencyId: price.currencyId,
            tourId,
        })));
    }
    if (data.discounts && data.discounts.length > 0) {
        yield db_1.db.insert(schema_1.tourDiscounts).values(data.discounts.map((discount) => {
            var _a;
            return ({
                tourId,
                targetGroup: discount.targetGroup,
                type: discount.type,
                value: discount.value,
                minPeople: (_a = discount.minPeople) !== null && _a !== void 0 ? _a : 0,
                maxPeople: discount.maxPeople,
            });
        }));
    }
    if (data.images && data.images.length > 0) {
        yield db_1.db.insert(schema_1.tourImages).values(data.images.map((imagePath) => ({
            tourId,
            imagePath,
        })));
    }
    if ((_d = data.highlights) === null || _d === void 0 ? void 0 : _d.length) {
        yield db_1.db
            .insert(schema_1.tourHighlight)
            .values(data.highlights.map((content) => ({ content, tourId })));
    }
    if ((_e = data.includes) === null || _e === void 0 ? void 0 : _e.length) {
        yield db_1.db
            .insert(schema_1.tourIncludes)
            .values(data.includes.map((content) => ({ content, tourId })));
    }
    if ((_f = data.excludes) === null || _f === void 0 ? void 0 : _f.length) {
        yield db_1.db
            .insert(schema_1.tourExcludes)
            .values(data.excludes.map((content) => ({ content, tourId })));
    }
    if ((_g = data.itinerary) === null || _g === void 0 ? void 0 : _g.length) {
        yield db_1.db.insert(schema_1.tourItinerary).values(data.itinerary.map((item) => ({
            title: item.title,
            imagePath: item.imagePath,
            describtion: item.description,
            tourId,
        })));
    }
    if ((_h = data.faq) === null || _h === void 0 ? void 0 : _h.length) {
        yield db_1.db.insert(schema_1.tourFAQ).values(data.faq.map((item) => ({
            question: item.question,
            answer: item.answer,
            tourId,
        })));
    }
    if ((_j = data.daysOfWeek) === null || _j === void 0 ? void 0 : _j.length) {
        yield db_1.db
            .insert(schema_1.tourDaysOfWeek)
            .values(data.daysOfWeek.map((day) => ({ dayOfWeek: day, tourId })));
    }
    if ((_k = data.extras) === null || _k === void 0 ? void 0 : _k.length) {
        for (const extra of data.extras) {
            const [extraPrice] = yield db_1.db
                .insert(schema_1.tourPrice)
                .values({
                adult: extra.price.adult,
                child: extra.price.child,
                infant: extra.price.infant,
                currencyId: extra.price.currencyId,
                tourId,
            })
                .$returningId();
            yield db_1.db.insert(schema_1.tourExtras).values({
                tourId,
                extraId: extra.extraId,
                priceId: extraPrice.id,
            });
        }
    }
    yield (0, generateSchedules_1.generateTourSchedules)({
        tourId,
        startDate: data.startDate,
        endDate: data.endDate,
        daysOfWeek: data.daysOfWeek,
        maxUsers: data.maxUsers,
        durationDays: data.durationDays,
        durationHours: data.durationHours,
    });
    (0, response_1.SuccessResponse)(res, { message: "Tour Created Successfully" }, 201);
});
exports.createTour = createTour;
