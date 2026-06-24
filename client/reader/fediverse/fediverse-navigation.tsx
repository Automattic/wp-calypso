import { useTranslate, type TranslateResult } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { TIMELINE_TAB, PROFILE_TAB, NOTIFICATIONS_TAB } from './helper';

interface Tab {
	slug: string;
	title: TranslateResult;
	path: string;
}

interface Props {
	connectionId: number;
	selectedTab: string;
}

export function FediverseNavigation( { connectionId, selectedTab }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordTabClick = ( tab: string ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_fediverse_tab_clicked', {
				connection_id: connectionId,
				tab,
			} )
		);
	};

	const tabs: Tab[] = [
		{
			slug: TIMELINE_TAB,
			title: translate( 'Timeline' ),
			path: `/reader/fediverse/${ connectionId }/${ TIMELINE_TAB }`,
		},
		{
			slug: NOTIFICATIONS_TAB,
			title: translate( 'Notifications' ),
			path: `/reader/fediverse/${ connectionId }/${ NOTIFICATIONS_TAB }`,
		},
		{
			slug: PROFILE_TAB,
			title: translate( 'Profile' ),
			path: `/reader/fediverse/${ connectionId }/${ PROFILE_TAB }`,
		},
	];

	const selected = tabs.find( ( tab ) => tab.slug === selectedTab );

	return (
		<SectionNav
			className="fediverse-navigation"
			selectedText={ selected?.title }
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
}
