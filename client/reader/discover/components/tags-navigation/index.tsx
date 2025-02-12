import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import ScrollableHorizontalNavigation from 'calypso/components/scrollable-horizontal-navigation';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import wpcom from 'calypso/lib/wp';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';

interface Tag {
	title: string;
	slug: string;
}

interface Props {
	selectedTag?: string;
	width: number;
	onTagSelect: ( tag: string ) => void;
}

type InterestResponse = {
	interests: Tag[];
};

export const useRecommendedTags = (): Tag[] => {
	const locale = useLocale();
	const translate = useTranslate();

	const { data: interestTags = [] } = useQuery< InterestResponse, unknown, Tag[] >( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );

	const promptSlug = isBloganuary() ? 'bloganuary' : 'dailyprompt';
	const promptTitle = isBloganuary() ? translate( 'Bloganuary' ) : translate( 'Daily prompts' );

	// Add dailyprompt to the front of interestTags if not present.
	const hasPromptTab = interestTags.filter( ( tag ) => tag.slug === promptSlug ).length;
	if ( ! hasPromptTab ) {
		interestTags.unshift( { title: promptTitle, slug: promptSlug } );
	}

	return interestTags;
};

const DiscoverTagsNavigation = ( { selectedTag, width, onTagSelect }: Props ) => {
	const recommendedTags = useRecommendedTags();

	const recordTabClick = () => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
	};

	const menuTabClick = ( tab: string ) => {
		onTagSelect( tab );
		recordTabClick();
	};

	return (
		<ScrollableHorizontalNavigation
			className="discover-stream-navigation"
			onTabClick={ menuTabClick }
			selectedTab={ selectedTag || '' }
			tabs={ recommendedTags }
			width={ width }
		/>
	);
};

export default DiscoverTagsNavigation;
