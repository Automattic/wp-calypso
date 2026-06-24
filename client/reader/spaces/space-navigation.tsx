import { useTranslate, type TranslateResult } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getSpaceTabPath, SPACE_TABS, type SpaceTab } from './routes';

interface Props {
	spaceId: string;
	selectedTab: SpaceTab;
}

/**
 * Route-driven sub-navigation for a space view. Each tab is a link to its own
 * path (Feed is the base path, Discover a suffix), so the active tab survives a
 * refresh and can be linked to directly — mirroring the Mastodon/ATmosphere
 * account navigations.
 */
export function SpaceNavigation( { spaceId, selectedTab }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const labels: Record< SpaceTab, TranslateResult > = {
		feed: translate( 'Feed' ),
		discover: translate( 'Discover' ),
	};

	const recordTabClick = ( tab: SpaceTab ) => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_spaces_tab_clicked', { tab } ) );
	};

	return (
		<SectionNav
			className="space-navigation"
			selectedText={ labels[ selectedTab ] }
			variation="minimal"
			enforceTabsView
		>
			<NavTabs hasHorizontalScroll>
				{ SPACE_TABS.map( ( tab ) => (
					<NavItem
						key={ tab }
						selected={ selectedTab === tab }
						path={ getSpaceTabPath( spaceId, tab ) }
						onClick={ () => recordTabClick( tab ) }
					>
						{ labels[ tab ] }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
}
