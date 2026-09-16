export type ReadFourForFourStatus = 'opted_in' | 'opted_out' | 'completed';

export interface ReadFourForFourCandidateResponse {
	blog_id: number;
	feed_id: number;
	name: string;
	url: string;
	feed_url: string;
	description?: string;
	icon?: string | null;
	subscribers_count: number;
	program_follows_count: number;
	is_participant: boolean;
	first_post?: {
		id: number;
		title: string;
		url: string;
		date: string;
	};
}

export interface ReadFourForFourCandidatesResponse {
	candidates: ReadFourForFourCandidateResponse[];
}

export interface ReadFourForFourStatusResponse {
	status: ReadFourForFourStatus | null;
	blog_id: number | null;
	followed_blog_ids: number[];
}

export interface ReadFourForFourProgressParams {
	blog_ids: number[];
}
