export interface Achievement {
	achievement_id: number;
	slug: string;
	name: string;
	description: string;
	badge_prefix: string;
	level: number;
	site_ID: number;
	date: string;
	image: string;
	url: string;
}

export interface AchievementsResponse {
	found: number;
	achievements: Achievement[];
}
