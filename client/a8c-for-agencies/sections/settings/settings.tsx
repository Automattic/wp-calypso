import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutNavigation, {
	buildNavItems,
	LayoutNavigationItemProps,
	LayoutNavigationTabs,
} from 'calypso/a8c-for-agencies/components/layout/nav';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_SETTINGS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AgencyProfile from './agency-profile';
import { SETTINGS_AGENCY_PROFILE_TAB } from './constants';

type Props = {
	tab: string;
};

export default function Settings( { tab }: Props ) {
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
		selectedKey: tab,
		basePath: A4A_SETTINGS_LINK,
		onItemClick: () => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_settings_click', {
					status: tab,
				} )
			);
		},
	} );

	const selectedItemProps = {
		selectedText: settingsTabs[ tab ].label,
	};

	// Content tab switch
	let tabContent = null;
	switch ( tab ) {
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
