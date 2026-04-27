export interface Trophy {
	achievement_id: number;
	site_ID: number;
	type: string;
	level: number;
	title: string;
	date: string;
	image: string;
	message: string;
	url: string;
}

export interface TrophiesResponse {
	found: number;
	can_post: boolean;
	trophies: Trophy[];
}
