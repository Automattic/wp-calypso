import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_SETTINGS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutNavigation, {
	buildNavItems,
	LayoutNavigationItemProps,
	LayoutNavigationTabs,
} from 'calypso/layout/multi-sites-dashboard/nav';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AgencyProfile from './agency-profile';
import { SETTINGS_AGENCY_PROFILE_TAB } from './constants';

type Props = {
	selectedTab: string;
};

export default function Settings( { selectedTab }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const title = translate( 'Settings' );

	// Define here all the Settings tabs
	const settingsTabs: { [ key: string ]: LayoutNavigationItemProps } = {
		[ SETTINGS_AGENCY_PROFILE_TAB ]: {
			key: SETTINGS_AGENCY_PROFILE_TAB,
			label: translate( 'Agency Profile' ),
		},
	};

	// Build all the navigation items
	const navItems = buildNavItems( {
		items: Object.values( settingsTabs ),
		selectedKey: selectedTab,
		basePath: A4A_SETTINGS_LINK,
		onItemClick: () => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_settings_click', {
					status: selectedTab,
				} )
			);
		},
	} );

	const selectedItemProps = {
		selectedText: settingsTabs[ selectedTab ].label,
	};

	// Content tab switch
	let tabContent = null;
	switch ( selectedTab ) {
		case SETTINGS_AGENCY_PROFILE_TAB:
			tabContent = <AgencyProfile />;
			break;
	}

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
				</LayoutHeader>
				<LayoutNavigation { ...selectedItemProps }>
					<LayoutNavigationTabs { ...selectedItemProps } items={ navItems } />
				</LayoutNavigation>
			</LayoutTop>
			<LayoutBody>{ tabContent }</LayoutBody>
		</Layout>
	);
}
