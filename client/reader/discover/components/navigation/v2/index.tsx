import { useLocale } from '@automattic/i18n-utils/src/locale-context';
import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils/src/utils';
import { translate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { DEFAULT_TAB, FIRST_POSTS_TAB, LATEST_TAB } from 'calypso/reader/discover/helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import './style.scss';

interface Tab {
	slug: string;
	title: string;
	path: string;
}

interface Props {
	selectedTab: string;
}

const DiscoverNavigationV2 = ( { selectedTab }: Props ) => {
	const currentLocale = useLocale();

	const recordTabClick = () => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
	};

	const getLocalizedPath = ( path: string ) => {
		return addLocaleToPathLocaleInFront( path, currentLocale );
	};

	const baseTabs: Tab[] = [
		{
			slug: DEFAULT_TAB,
			title: translate( 'Recommended' ),
			path: '/discover',
		},
		{
			slug: 'add-new',
			title: translate( 'Add new' ),
			path: '/discover/add-new',
		},
		{
			slug: FIRST_POSTS_TAB,
			title: translate( 'First posts' ),
			path: '/discover/firstposts',
		},
		{
			slug: 'tags',
			title: translate( 'Tags' ),
			path: '/discover/tags?selectedTag=dailyprompt',
		},
		{
			slug: 'reddit',
			title: translate( 'Reddit' ),
			path: '/discover/reddit',
		},
		{
			slug: LATEST_TAB,
			title: translate( 'Latest' ),
			path: '/discover/latest',
		},
	];

	// Add localization to paths if needed.
	const tabs = baseTabs.map( ( tab ) => ( {
		...tab,
		path: getLocalizedPath( tab.path ),
	} ) );

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
						path={ tab.path }
						onClick={ recordTabClick }
					>
						{ tab.title }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
};

export default DiscoverNavigationV2;
