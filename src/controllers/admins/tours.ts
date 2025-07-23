import { Request, Response } from "express";
import { db } from "../../models/db";
import {
  categories,
  currencies,
  extras,
  tourDaysOfWeek,
  tourDiscounts,
  tourExcludes,
  tourExtras,
  tourFAQ,
  tourHighlight,
  tourImages,
  tourIncludes,
  tourItinerary,
  tourPrice,
  tours,
  tourSchedules,
} from "../../models/schema";
import { SuccessResponse } from "../../utils/response";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { generateTourSchedules } from "../../utils/generateSchedules";
import { saveBase64Image } from "../../utils/handleImages";
import { v4 as uuid } from "uuid";

export const getAllTours = async (req: Request, res: Response) => {
  const toursData = await db.select().from(tours);
  SuccessResponse(res, { tours: toursData }, 200);
};

export const getTourById = async (req: Request, res: Response) => {
  const tourId = Number(req.params.id);
  const [mainTour] = await db
    .select({
      id: tours.id,
      title: tours.title,
      mainImage: tours.mainImage,
      description: tours.describtion,
      featured: tours.featured,
      status: tours.status,
      startDate: tours.startDate,
      endDate: tours.endDate,
      durationDays: tours.durationDays,
      durationHours: tours.durationHours,
      country: tours.country,
      city: tours.city,
      maxUsers: tours.maxUsers,
      category: categories.name,
      price: {
        adult: tourPrice.adult,
        child: tourPrice.child,
        infant: tourPrice.infant,
        currency: currencies.name,
      },
    })
    .from(tours)
    .leftJoin(categories, eq(tours.categoryId, categories.id))
    .leftJoin(tourPrice, eq(tours.priceId, tourPrice.id))
    .leftJoin(currencies, eq(tourPrice.currencyId, currencies.id))
    .where(eq(tours.id, tourId));

  if (!mainTour) throw new NotFound("tour not found");

  const [
    highlights,
    includes,
    excludes,
    itinerary,
    faq,
    discounts,
    daysOfWeek,
    extrasWithPrices,
    images,
  ] = await Promise.all([
    db.select().from(tourHighlight).where(eq(tourHighlight.tourId, tourId)),
    db.select().from(tourIncludes).where(eq(tourIncludes.tourId, tourId)),
    db.select().from(tourExcludes).where(eq(tourExcludes.tourId, tourId)),
    db.select().from(tourItinerary).where(eq(tourItinerary.tourId, tourId)),
    db.select().from(tourFAQ).where(eq(tourFAQ.tourId, tourId)),
    db.select().from(tourDiscounts).where(eq(tourDiscounts.tourId, tourId)),
    db
      .select({ dayOfWeek: tourDaysOfWeek.dayOfWeek })
      .from(tourDaysOfWeek)
      .where(eq(tourDaysOfWeek.tourId, tourId)),
    db
      .select({
        id: extras.id,
        name: extras.name,
        price: {
          adult: tourPrice.adult,
          child: tourPrice.child,
          infant: tourPrice.infant,
        },
      })
      .from(tourExtras)
      .leftJoin(extras, eq(tourExtras.extraId, extras.id))
      .leftJoin(tourPrice, eq(tourExtras.priceId, tourPrice.id))
      .where(eq(tourExtras.tourId, tourId)),
    db
      .select({ imagePath: tourImages.imagePath })
      .from(tourImages)
      .where(eq(tourImages.tourId, tourId)),
  ]);

  SuccessResponse(
    res,
    {
      ...mainTour,
      highlights: highlights.map((h) => h.content),
      includes: includes.map((i) => i.content),
      excludes: excludes.map((e) => e.content),
      itinerary: itinerary.map((i) => ({
        title: i.title,
        imagePath: i.imagePath,
        description: i.describtion,
      })),
      faq: faq.map((f) => ({ question: f.question, answer: f.answer })),
      discounts,
      daysOfWeek: daysOfWeek.map((d) => d.dayOfWeek),
      extras: extrasWithPrices,
      images: images.map((img) => img.imagePath),
    },
    200
  );
};

export const createTour = async (req: Request, res: Response) => {
  const data = req.body;
  const [insertedPrice] = await db.insert(tourPrice).values({
    adult: data.prices[0].adult,
    child: data.prices[0].child,
    infant: data.prices[0].infant,
    currencyId: data.prices[0].currencyId,
  });

  const [newTour] = await db
    .insert(tours)
    .values({
      title: data.title,
      mainImage: await saveBase64Image(data.mainImage, uuid(), req, "tours"),
      categoryId: data.categoryId,
      describtion: data.description,
      status: true,
      featured: data.featured ?? false,
      meetingPoint: data.meetingPoint ?? false,
      meetingPointLocation: data.meetingPoint
        ? data.meetingPointLocation
        : null,
      meetingPointAddress: data.meetingPoint ? data.meetingPointAddress : null,
      points: data.points ?? 0,
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays: data.durationDays,
      durationHours: data.durationHours,
      country: data.country,
      city: data.city,
      maxUsers: data.maxUsers,
      priceId: insertedPrice.insertId,
    })
    .$returningId();

  const tourId = newTour.id;

  // Insert related content if provided
  if (data.discounts && data.discounts.length > 0) {
    await db.insert(tourDiscounts).values(
      data.discounts.map((discount: any) => ({
        tourId,
        targetGroup: discount.targetGroup,
        type: discount.type,
        value: discount.value,
        minPeople: discount.minPeople ?? 0,
        maxPeople: discount.maxPeople,
      }))
    );
  }

  if (data.images && data.images.length > 0) {
    await db.insert(tourImages).values(
      data.images.map((imagePath: any) => ({
        tourId,
        imagePath,
      }))
    );
  }

  if (data.highlights?.length) {
    await db
      .insert(tourHighlight)
      .values(data.highlights.map((content: string) => ({ content, tourId })));
  }

  if (data.includes?.length) {
    await db
      .insert(tourIncludes)
      .values(data.includes.map((content: string) => ({ content, tourId })));
  }

  if (data.excludes?.length) {
    await db
      .insert(tourExcludes)
      .values(data.excludes.map((content: string) => ({ content, tourId })));
  }

  if (data.itinerary?.length) {
    await db.insert(tourItinerary).values(
      data.itinerary.map((item: any) => ({
        title: item.title,
        imagePath: item.imagePath,
        describtion: item.description,
        tourId,
      }))
    );
  }

  if (data.faq?.length) {
    await db.insert(tourFAQ).values(
      data.faq.map((item: any) => ({
        question: item.question,
        answer: item.answer,
        tourId,
      }))
    );
  }

  if (data.daysOfWeek?.length) {
    await db
      .insert(tourDaysOfWeek)
      .values(
        data.daysOfWeek.map((day: string) => ({ dayOfWeek: day, tourId }))
      );
  }

  if (data.extras?.length) {
    for (const extra of data.extras) {
      const [extraPrice] = await db
        .insert(tourPrice)
        .values({
          adult: extra.price.adult,
          child: extra.price.child,
          infant: extra.price.infant,
          currencyId: extra.price.currencyId,
        })
        .$returningId();

      await db.insert(tourExtras).values({
        tourId,
        extraId: extra.extraId,
        priceId: extraPrice.id,
      });
    }
  }
  await generateTourSchedules({
    tourId,
    startDate: data.startDate,
    endDate: data.endDate,
    daysOfWeek: data.daysOfWeek,
    maxUsers: data.maxUsers,
    durationDays: data.durationDays,
    durationHours: data.durationHours,
  });

  SuccessResponse(res, { message: "Tour Created Successfully" }, 201);
};
