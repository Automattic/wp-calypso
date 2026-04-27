export interface Achievement {
	achievement_id: number;
	slug: string;
	name: string;
	description: string;
	badge_prefix: string;
	level: number;
	date: string;
	image: string;
	retired: boolean;
	/** Only present when viewing your own achievements. */
	site_ID?: number;
	/** Only present when viewing your own achievements. */
	url?: string;
}

export interface AchievementsResponse {
	found: number;
	achievements: Achievement[];
}
