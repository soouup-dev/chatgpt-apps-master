PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`rating` integer NOT NULL,
	`text` text NOT NULL,
	`file_id` text NOT NULL,
	`crated_at` integer DEFAULT (unixepoch()),
	PRIMARY KEY(`product_id`, `user_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "rating_1_5" CHECK("__new_reviews"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("user_id", "product_id", "rating", "text", "file_id", "crated_at") SELECT "user_id", "product_id", "rating", "text", "file_id", "crated_at" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
PRAGMA foreign_keys=ON;