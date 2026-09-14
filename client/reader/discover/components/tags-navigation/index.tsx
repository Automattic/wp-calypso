import { useTranslate } from 'i18n-calypso';
import ScrollableHorizontalNavigation from 'calypso/components/scrollable-horizontal-navigation';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import { useReaderInterestTags } from 'calypso/data/reader/use-reader-interest-tags';
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

export const useRecommendedTags = (): Tag[] => {
	const interestTopics = useReaderInterestTags();
	const translate = useTranslate();

	const promptSlug = isBloganuary() ? 'bloganuary' : 'dailyprompt';
	const promptTitle = isBloganuary() ? translate( 'Bloganuary' ) : translate( 'Daily prompts' );

	const interestTags: Tag[] = interestTopics.map( ( topic ) => ( {
		title: topic.name,
		slug: topic.tag,
	} ) );

	// Add dailyprompt to the front of tags if not present.
	const hasPromptTab = interestTags.some( ( tag ) => tag.slug === promptSlug );
	if ( ! hasPromptTab ) {
		return [ { title: promptTitle, slug: promptSlug }, ...interestTags ];
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
