export type ChipFilter = 'all' | 'conversations' | 'likes' | 'reposts' | 'follows';

export const CHIP_FILTERS: ChipFilter[] = [ 'all', 'conversations', 'likes', 'reposts', 'follows' ];

export function chipFilterToTypes( filter: ChipFilter ): string | undefined {
	switch ( filter ) {
		case 'all':
			return undefined;
		case 'conversations':
			return 'mention,reply,quote';
		case 'likes':
			return 'like';
		case 'reposts':
			return 'repost';
		case 'follows':
			return 'follow';
		default: {
			const _exhaustive: never = filter;
			void _exhaustive;
			return undefined;
		}
	}
}
