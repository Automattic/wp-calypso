import page from '@automattic/calypso-router';
import ScrollableHorizontalNavigation from 'calypso/components/scrollable-horizontal-navigation';
import { addQueryArgs } from 'calypso/lib/url';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';

interface Tag {
	title: string;
	slug: string;
}

interface Props {
	recommendedTags: Tag[];
	selectedTag?: string;
	width: number;
}

const DiscoverTagsNavigation = ( { recommendedTags, selectedTag, width }: Props ) => {
	const recordTabClick = () => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
	};

	const menuTabClick = ( tab: string ) => {
		page.replace( addQueryArgs( { selectedTag: tab }, '/discover/tags' ) );
		recordTabClick();
	};

	return (
		<ScrollableHorizontalNavigation
			className="discover-stream-navigation"
			onTabClick={ menuTabClick }
			selectedTab={ selectedTag }
			tabs={ recommendedTags }
			width={ width }
		/>
	);
};

export default DiscoverTagsNavigation;
