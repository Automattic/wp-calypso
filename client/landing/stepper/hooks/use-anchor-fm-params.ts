import { useQuery } from './use-query';

export function useAnchorFmEpisodeId(): string | null {
	return useQuery().get( 'anchor_episode' );
}
