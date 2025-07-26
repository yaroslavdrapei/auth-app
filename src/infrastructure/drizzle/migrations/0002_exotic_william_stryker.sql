ALTER TABLE "users" ALTER COLUMN "password_hash" SET DATA TYPE varchar(150);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");