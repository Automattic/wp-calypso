import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutNavigation, {
	LayoutNavigationTabs,
} from 'calypso/a8c-for-agencies/components/layout/nav';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_SETTINGS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AgencyProfile from './agency-profile';

export default function Settings() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const title = translate( 'Settings' );

	const navItems = [
		{
			key: 'agency_profile',
			label: translate( 'Agency Profile' ),
		},
	].map( ( navItem ) => ( {
		...navItem,
		selected: true,
		path: `${ A4A_SETTINGS_LINK }/agency-profile`,
		onClick: () => {
			dispatch( recordTracksEvent( 'calypso_a4a_settings_agency_profile_click' ) );
		},
	} ) );

	const selectedItem = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];
	const selectedItemProps = {
		selectedText: selectedItem.label,
	};

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
			<LayoutBody>
				<h1>This is the Settings section with tabs (WIP)</h1>
				<AgencyProfile />
			</LayoutBody>
		</Layout>
	);
}
