import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import {
	DEFAULT_TAB,
	FIRST_POSTS_TAB,
	LATEST_TAB,
	ADD_NEW_TAB,
	REDDIT_TAB,
} from 'calypso/reader/discover/helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import './style.scss';

interface Tab {
	slug: string;
	title: string;
	path: string;
}

interface Props {
	selectedTab: string;
}

const DiscoverNavigation = ( { selectedTab }: Props ) => {
	const currentLocale = useLocale();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const recordTabClick = ( tab: string ) => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
		dispatch( recordReaderTracksEvent( 'calypso_reader_discover_tab_clicked', { tab } ) );
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
			slug: ADD_NEW_TAB,
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
			slug: REDDIT_TAB,
			title: translate( 'Reddit' ),
			path: '/discover/reddit',
		},
		{
			slug: LATEST_TAB,
			title: translate( 'Latest' ),
			path: '/discover/latest',
		},
	];

	// Only show the "Add new" and "Reddit" tabs if the user is logged in.
	const filteredTabs = baseTabs.filter(
		( tab ) => ( tab.slug !== ADD_NEW_TAB && tab.slug !== REDDIT_TAB ) || isLoggedIn
	);

	// Add localization to paths if needed.
	const tabs = filteredTabs.map( ( tab ) => ( {
		...tab,
		path: getLocalizedPath( tab.path ),
	} ) );

	const selectedTabData = tabs.find( ( tab ) => tab.slug === selectedTab );

	return (
		<SectionNav
			className="discover-navigation"
			selectedText={ selectedTabData?.title }
			enforceTabsView
		>
			<NavTabs hasHorizontalScroll>
				{ tabs.map( ( tab ) => (
					<NavItem
						key={ tab.slug }
						selected={ selectedTab === tab.slug }
						path={ tab.path }
						onClick={ () => recordTabClick( tab.slug ) }
					>
						{ tab.title }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
};

export default DiscoverNavigation;
