import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import { translate, TranslateResult } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { LATEST_TAB, RECOMMENDED_TAB } from 'calypso/reader/discover/helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { FRESHLY_PRESSED_TAB } from '../../helper';
import './style.scss';

interface Tab {
	slug: string;
	title: TranslateResult;
	path: string;
}

interface Props {
	selectedTab: string;
}

const DiscoverNavigation = ( { selectedTab }: Props ) => {
	const currentLocale = useLocale();
	const dispatch = useDispatch();

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
			slug: FRESHLY_PRESSED_TAB,
			title: translate( 'Freshly Pressed' ),
			path: '/discover',
		},
		{
			slug: RECOMMENDED_TAB,
			title: translate( 'Recommended' ),
			path: '/discover/recommended',
		},
		{
			slug: 'tags',
			title: translate( 'Tags' ),
			path: '/discover/tags?selectedTag=dailyprompt',
		},
		{
			slug: LATEST_TAB,
			title: translate( 'Latest', {
				context: 'latest blog posts',
			} ),
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
			className="discover-navigation"
			selectedText={ selectedTabData?.title }
			variation="minimal"
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
