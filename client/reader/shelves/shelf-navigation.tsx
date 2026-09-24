import { useTranslate, type TranslateResult } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getShelfTabPath, SHELF_TABS, type ShelfTab } from './routes';

interface Props {
	shelfSlug: string;
	selectedTab: ShelfTab;
}

/**
 * Route-driven sub-navigation for a shelf view. Each tab is a link to its own
 * path (Feed is the base path, Discover a suffix), so the active tab survives a
 * refresh and can be linked to directly — mirroring the Mastodon/ATmosphere
 * account navigations.
 */
export function ShelfNavigation( { shelfSlug, selectedTab }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const labels: Record< ShelfTab, TranslateResult > = {
		feed: translate( 'Feed' ),
		discover: translate( 'Discover' ),
	};

	const recordTabClick = ( tab: ShelfTab ) => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_shelves_tab_clicked', { tab } ) );
	};

	return (
		<SectionNav
			className="shelf-navigation"
			selectedText={ labels[ selectedTab ] }
			variation="minimal"
			enforceTabsView
		>
			<NavTabs hasHorizontalScroll>
				{ SHELF_TABS.map( ( tab ) => (
					<NavItem
						key={ tab }
						selected={ selectedTab === tab }
						path={ getShelfTabPath( shelfSlug, tab ) }
						onClick={ () => recordTabClick( tab ) }
					>
						{ labels[ tab ] }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
}
