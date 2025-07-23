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
import { getCurrentEgyptTime } from "../utils/timeZone";

export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
  imagePath: varchar("image_path", { length: 255 }),
  isSuperAdmin: boolean("is_super_admin").default(false),
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
  email: varchar("email", { length: 255 }).unique().notNull(),
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

export const tourImages = mysqlTable("tour_images", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id").references(() => tours.id),
  imagePath: varchar("image_path", { length: 255 }),
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
  startDate: date("start_date").notNull(), // Optional if your logic needs range per schedule
  endDate: date("end_date").notNull(),
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

export const emailVerifications = mysqlTable("email_verifications", {
  userId: int("user_id").primaryKey(),
  code: varchar("code", { length: 6 }).notNull(),
  createdAt: date("created_at").default(getCurrentEgyptTime()),
});

export const extras = mysqlTable("extras", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const tourExtras = mysqlTable("tour_extras", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tour_id").references(() => tours.id),
  extraId: int("extra_id").references(() => extras.id),
  priceId: int("price_id").references(() => tourPrice.id),
});

export const userTour = mysqlTable("user_tour", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  tourId: int("tour_id").references(() => tourSchedules.id),
  date: date().default(getCurrentEgyptTime()),
  status: mysqlEnum("status", ["pending", "cancelled", "booked"]),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  tourId: int("tour_id").references(() => tourSchedules.id),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]),
  createdAt: date().default(getCurrentEgyptTime()),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("booking_id").references(() => bookings.id),
  method: mysqlEnum("method", ["manual", "auto"]),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]),
  amount: decimal("amount"),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: date().default(getCurrentEgyptTime()),
  rejectionReason: varchar("rejection_reason", { length: 255 }),
});

export const manualPaymentMethod = mysqlTable("manual_payment_method", {
  id: int("id").autoincrement().primaryKey(),
  paymentId: int("payment_id").references(() => payments.id),
  proofImage: varchar("proof_image", { length: 255 }),
  prooftext: varchar("proof_text", { length: 255 }),
  uploadedAt: date().default(getCurrentEgyptTime()),
});

export const homePageCover = mysqlTable("home_page_cover", {
  id: int("id").autoincrement().primaryKey(),
  imagePath: varchar("image_path", { length: 255 }).notNull(),
  status: boolean("status").default(false).notNull(),
});

export const homePageFAQ = mysqlTable("home_page_faq", {
  id: int("id").autoincrement().primaryKey(),
  question: varchar("question", { length: 255 }).notNull(),
  answer: text("answer").notNull(),
});
