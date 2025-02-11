import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { addQueryArgs } from 'calypso/lib/url';
import { DEFAULT_TAB, FIRST_POSTS_TAB, LATEST_TAB } from 'calypso/reader/discover/helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import './style.scss';

interface Tab {
	slug: string;
	title: string;
}

interface Props {
	selectedTab: string;
}

const DiscoverNavigationV2 = ( { selectedTab }: Props ) => {
	const recordTabClick = () => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
	};

	const menuTabClick = ( tab: string ) => {
		page.replace(
			addQueryArgs( { selectedTab: tab }, window.location.pathname + window.location.search )
		);
		recordTabClick();
	};

	const tabs: Tab[] = [
		{
			slug: DEFAULT_TAB,
			title: translate( 'Recommended' ),
		},
		{
			slug: 'add-new',
			title: translate( 'Add new' ),
		},
		{
			slug: FIRST_POSTS_TAB,
			title: translate( 'First posts' ),
		},
		{
			slug: 'tags',
			title: translate( 'Tags' ),
		},
		{
			slug: 'reddit',
			title: translate( 'Reddit' ),
		},
		{
			slug: LATEST_TAB,
			title: translate( 'Latest' ),
		},
	];

	const selectedTabData = tabs.find( ( tab ) => tab.slug === selectedTab );

	return (
		<SectionNav
			className="discover-navigation-v2"
			selectedText={ selectedTabData?.title }
			enforceTabsView
		>
			<NavTabs hasHorizontalScroll>
				{ tabs.map( ( tab ) => (
					<NavItem
						key={ tab.slug }
						selected={ selectedTab === tab.slug }
						onClick={ () => menuTabClick( tab.slug ) }
					>
						{ tab.title }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
};

export default DiscoverNavigationV2;
