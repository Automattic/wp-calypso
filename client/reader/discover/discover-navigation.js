import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import ScrollableHorizontalNavigation from 'calypso/components/scrollable-horizontal-navigation';
import { addQueryArgs } from 'calypso/lib/url';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { DEFAULT_TAB, FIRST_POSTS_TAB, LATEST_TAB } from './helper';
import './discover-navigation.scss';

const DiscoverNavigation = ( { recommendedTags, selectedTab, width } ) => {
	const recordTabClick = () => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
	};

	const menuTabClick = ( tab ) => {
		page.replace(
			addQueryArgs( { selectedTab: tab }, window.location.pathname + window.location.search )
		);
		recordTabClick();
	};

	const tabs = [
		{
			slug: DEFAULT_TAB,
			title: translate( 'Recommended' ),
		},
		...( config.isEnabled( 'reader/first-posts-stream' )
			? [
					{
						slug: FIRST_POSTS_TAB,
						title: translate( 'First posts' ),
					},
			  ]
			: [] ),
		{
			slug: LATEST_TAB,
			title: translate( 'Latest' ),
		},
	].concat( recommendedTags );

	return (
		<ScrollableHorizontalNavigation
			className="discover-stream-navigation"
			onTabClick={ menuTabClick }
			selectedTab={ selectedTab }
			tabs={ tabs }
			width={ width }
		/>
	);
};

export default DiscoverNavigation;
