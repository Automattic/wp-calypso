import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import Sidebar from 'calypso/layout/sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import 'calypso/components/jetpack/sidebar/style.scss';

type Props = {
	path: string;
};

const PartnerPortalSidebar: React.FC< Props > = ( { path } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onNavigate = useCallback(
		( menuItem: string ) => () => {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
					menu_item: menuItem,
				} )
			);
		},
		[ dispatch ]
	);

	return (
		<Sidebar className="sidebar__jetpack-cloud">
			<SidebarRegion>
				<SidebarMenu>
					<SidebarItem
						customIcon={ <JetpackIcons icon="licenses" /> }
						label={ translate( 'Licenses', {
							comment: 'Jetpack sidebar navigation item',
						} ) }
						link="/partner-portal/licenses"
						onNavigate={ onNavigate( 'Jetpack Cloud / Partner Portal / Licenses' ) }
						selected={ itemLinkMatches( '/partner-portal/licenses', path ) }
					/>

					<SidebarItem
						customIcon={ <JetpackIcons icon="money" /> }
						label={ translate( 'Billing', {
							comment: 'Jetpack sidebar navigation item',
						} ) }
						link="/partner-portal/billing"
						onNavigate={ onNavigate( 'Jetpack Cloud / Partner Portal' ) }
						selected={ path === '/partner-portal/billing' }
					/>

					<SidebarItem
						customIcon={ <JetpackIcons icon="credit-card" /> }
						label={ translate( 'Payment Methods', {
							comment: 'Jeptack sidebar navigation item',
						} ) }
						link="/partner-portal/payment-methods"
						onNavigate={ onNavigate( 'Jetpack Cloud / Partner Portal / Payment Methods' ) }
						selected={ itemLinkMatches( '/partner-portal/payment-methods', path ) }
					/>

					<SidebarItem
						customIcon={ <JetpackIcons icon="page" /> }
						label={ translate( 'Invoices', {
							comment: 'Jeptack sidebar navigation item',
						} ) }
						link="/partner-portal/invoices"
						onNavigate={ onNavigate( 'Jetpack Cloud / Partner Portal / Invoices' ) }
						selected={ itemLinkMatches( '/partner-portal/invoices', path ) }
					/>

					<SidebarItem
						customIcon={ <JetpackIcons icon="prices" /> }
						label={ translate( 'Prices', {
							comment: 'Jetpack sidebar navigation item',
						} ) }
						link="/partner-portal/prices"
						onNavigate={ onNavigate( 'Jetpack Cloud / Partner Portal / Prices' ) }
						selected={ itemLinkMatches( '/partner-portal/prices', path ) }
					/>

					<SidebarItem
						customIcon={ <JetpackIcons icon="settings" /> }
						label={ translate( 'Company Details', {
							comment: 'Jeptack sidebar navigation item',
						} ) }
						link="/partner-portal/company-details"
						onNavigate={ onNavigate( 'Jetpack Cloud / Partner Portal / Company Details' ) }
						selected={ itemLinkMatches( '/partner-portal/company-details', path ) }
					/>
				</SidebarMenu>
			</SidebarRegion>
		</Sidebar>
	);
};

export default PartnerPortalSidebar;
