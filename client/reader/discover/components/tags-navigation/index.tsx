import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import ScrollableHorizontalNavigation from 'calypso/components/scrollable-horizontal-navigation';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import wpcom from 'calypso/lib/wp';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

interface Tag {
	title: string;
	slug: string;
}

interface DiscoverTagsNavigationProps {
	selectedTag?: string;
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
			wpcom.req.get( { path: '/read/interests', apiNamespace: 'wpcom/v2' }, { _locale: locale } ),
		select: ( data ) => data.interests,
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

const DiscoverTagsNavigation = ( { selectedTag, onTagSelect }: DiscoverTagsNavigationProps ) => {
	const recommendedTags = useRecommendedTags();
	const dispatch = useDispatch();

	const recordTabClick = ( tab: string ) => {
		recordAction( 'click_discover_tag' );
		recordGaEvent( 'Clicked Discover Tag' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_discover_tag_tab_clicked', { tag: tab } ) );
	};

	const menuTabClick = ( tab: string ) => {
		onTagSelect( tab );
		recordTabClick( tab );
	};

	return (
		<ScrollableHorizontalNavigation
			className="discover-stream-navigation"
			onTabClick={ menuTabClick }
			selectedTab={ selectedTag || '' }
			tabs={ recommendedTags }
		/>
	);
};

export default DiscoverTagsNavigation;
