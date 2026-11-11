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
 * The subset of the Reader site shape that the Reader's site name and
 * description helpers read, filled from the candidate payload so the list can
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

/**
 * The content review of the writer's site. `not_personal_blog` and
 * `not_english` keep the site out of the program. `unchecked` means the model
 * failed, so the writer can carry on, though the site stays out of the pool
 * until a later review passes.
 */
export type ReadFourForFourReviewVerdict =
	'pass' | 'not_personal_blog' | 'not_english' | 'unchecked';

export type ReadFourForFourReviewCategory = 'personal' | 'commercial' | 'seo_or_spam' | 'other';

export interface ReadFourForFourStatusResponse {
	status: ReadFourForFourStatus | null;
	blog_id: number | null;
	followed_blog_ids: number[];
	/** Null when the writer's site has no review yet, so Calypso should request one. */
	review: { verdict: ReadFourForFourReviewVerdict } | null;
}

export interface ReadFourForFourReviewResponse {
	verdict: ReadFourForFourReviewVerdict;
	/** ISO 639-1 code, or null when the review is `unchecked`. */
	language: string | null;
	category: ReadFourForFourReviewCategory | null;
	/** Whether the server returned a stored verdict without calling the model. */
	is_cached: boolean;
}

export interface ReadFourForFourProgressParams {
	blog_ids: number[];
}
