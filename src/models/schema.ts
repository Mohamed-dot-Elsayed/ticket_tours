import {
  mysqlTable,
  serial,
  int,
  varchar,
  text,
  decimal,
  boolean,
  date,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
});

export const privileges = mysqlTable("privileges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const adminPrivileges = mysqlTable("admin_privileges", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("admin_id").references(() => admins.id),
  privilegeId: int("privilege_id").references(() => privileges.id),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  imagePath: varchar("imagePath", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: boolean("status").default(false),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }),
  phoneNumber: varchar("phoneNumber", { length: 255 }),
});

export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("category_id").references(() => categories.id),
  title: varchar("title", { length: 255 }).notNull(),
  mainImage: varchar("mainImage", { length: 255 }).notNull(),
  status: boolean("status").default(false),
  featured: boolean("featured").default(false),
  describtion: text("describtion"),
  meetingPoint: boolean("meetingPoint").default(false),
  meetingPointLocation: text("meetingPointLocation"),
  meetingPointAddress: text("meetingPointAddress"),
  points: int("points").default(0),
  startDate: date().notNull(),
  endDate: date().notNull(),
  durationDays: int("duration_days").notNull(),
  durationHours: int("duration_hours").notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  maxUsers: int("max_users").notNull(),
  priceId: int("price_id").references(() => tourPrice.id),
});

export const tourDiscounts = mysqlTable("tour_discounts", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id")
    .notNull()
    .references(() => tours.id, { onDelete: "cascade" }),
  targetGroup: mysqlEnum("target_group", [
    "adult",
    "child",
    "infant",
  ]).notNull(),
  type: mysqlEnum("type", ["percent", "fixed"]).notNull(),
  value: decimal("value", { precision: 5, scale: 2 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  minPeople: int("min_people").default(0),
  maxPeople: int("max_people"),
});

export const tourDaysOfWeek = mysqlTable("tour_days_of_week", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id")
    .notNull()
    .references(() => tours.id, { onDelete: "cascade" }),

  dayOfWeek: mysqlEnum("day_of_week", [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]).notNull(),
});

export const tourSchedules = mysqlTable("tour_schedules", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id")
    .notNull()
    .references(() => tours.id, { onDelete: "cascade" }),

  date: date("date").notNull(),
  availableSeats: int("available_seats").notNull(),
});

export const tourPrice = mysqlTable("tour_price", {
  id: int("id").autoincrement().primaryKey(),
  adult: decimal("adult").notNull(),
  child: decimal("child").notNull(),
  infant: decimal("infant").notNull(),
  currencyId: int("currency_id")
    .notNull()
    .references(() => currencies.id),
});

export const tourHighlight = mysqlTable("tour_highlight", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id").references(() => tours.id),
  content: varchar("content", { length: 255 }).notNull(),
});

export const tourIncludes = mysqlTable("tour_includes", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id").references(() => tours.id),
  content: varchar("content", { length: 255 }).notNull(),
});

export const tourExcludes = mysqlTable("tour_excludes", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id").references(() => tours.id),
  content: varchar("content", { length: 255 }).notNull(),
});

export const tourItinerary = mysqlTable("tour_itinerary", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id").references(() => tours.id),
  title: varchar("content", { length: 255 }).notNull(),
  imagePath: varchar("image_path", { length: 255 }),
  describtion: text("describtion"),
});

export const tourFAQ = mysqlTable("tour_faq", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id").references(() => tours.id),
  question: varchar("question", { length: 255 }),
  answer: varchar("answer", { length: 255 }),
});

export const currencies = mysqlTable("currencies", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 3 }).notNull(),
  name: varchar("name", { length: 50 }),
  symbol: varchar("symbol", { length: 5 }),
});

export const promoCode = mysqlTable("promo_code", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  discountType: mysqlEnum("discount_type", ["percentage", "amount"]).notNull(),
  discountValue: int("discount_value").notNull(),
  usageLimit: int("usade_limit").notNull(),
  status: boolean("status").default(false),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
});

export const promoCodeUsers = mysqlTable("promo_code_users", {
  id: int("id").autoincrement().primaryKey(),
  promoCodeId: int("promo_code_id").references(() => promoCode.id),
  userId: int("user_id").references(() => users.id),
});
