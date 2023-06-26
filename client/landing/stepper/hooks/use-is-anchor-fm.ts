import { useAnchorFmParams } from './use-anchor-fm-params';

export function isAnchorPodcastIdValid( anchorFmPodcastId: string | null ): boolean {
	return Boolean( anchorFmPodcastId && anchorFmPodcastId.match( /^[0-9a-f]{7,8}$/i ) );
}

export function useIsAnchorFm(): boolean {
	const { anchorFmPodcastId } = useAnchorFmParams();
	return isAnchorPodcastIdValid( anchorFmPodcastId );
}
