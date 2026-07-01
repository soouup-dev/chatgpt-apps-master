CREATE TABLE `storyboard_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`client_name` text NOT NULL,
	`project_name` text NOT NULL,
	`requirements` text NOT NULL,
	`duration` integer NOT NULL,
	`mood` text NOT NULL,
	`color_palette` text DEFAULT '[]' NOT NULL,
	`typography` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `storyboard_scenes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`scene_number` integer NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`description` text NOT NULL,
	`camera_movement` text NOT NULL,
	`copy_text` text NOT NULL,
	`bg_color` text NOT NULL,
	`transition` text NOT NULL,
	`bgm_direction` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `storyboard_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
