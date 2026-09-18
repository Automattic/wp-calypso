import type { ReadFourForFourCandidate, ReadFourForFourCandidateResponse } from './types';

export function adaptReadFourForFourCandidate(
	candidate: ReadFourForFourCandidateResponse
): ReadFourForFourCandidate {
	const icon = candidate.icon || null;
	const feedId = candidate.feed_id || null;
	return {
		blogId: candidate.blog_id,
		feedId,
		name: candidate.name,
		url: candidate.url,
		feedUrl: candidate.feed_url,
		icon,
		isParticipant: candidate.is_participant,
		streamKey: feedId ? `feed:${ feedId }` : `site:${ candidate.blog_id }`,
		site: {
			ID: candidate.blog_id,
			feed_ID: feedId ?? undefined,
			title: candidate.name,
			name: candidate.name,
			URL: candidate.url,
			feed_URL: candidate.feed_url,
			description: candidate.description || '',
			icon: icon ? { img: icon } : undefined,
		},
	};
}
