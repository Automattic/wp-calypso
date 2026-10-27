export type ReadFourForFourStatus = 'opted_in' | 'opted_out' | 'completed';

export interface ReadFourForFourCandidateResponse {
	blog_id: number;
	feed_id: number | null;
	name: string;
	url: string;
	feed_url: string;
	description: string;
	icon: string | null;
	is_participant: boolean;
}

export interface ReadFourForFourCandidatesResponse {
	candidates: ReadFourForFourCandidateResponse[];
}

/**
 * The subset of the Reader site shape that `ReaderSubscriptionListItem` and
 * the follow button read, filled from the candidate payload so the list can
 * render without a per-site request.
 */
export interface ReadFourForFourCandidateSite {
	ID: number;
	feed_ID?: number;
	title: string;
	name: string;
	URL: string;
	feed_URL: string;
	description: string;
	icon?: { img: string };
}

export interface ReadFourForFourCandidate {
	blogId: number;
	feedId: number | null;
	name: string;
	url: string;
	feedUrl: string;
	icon: string | null;
	isParticipant: boolean;
	streamKey: string;
	site: ReadFourForFourCandidateSite;
}

export interface ReadFourForFourStatusResponse {
	status: ReadFourForFourStatus | null;
	blog_id: number | null;
	followed_blog_ids: number[];
}

export interface ReadFourForFourProgressParams {
	blog_ids: number[];
}
