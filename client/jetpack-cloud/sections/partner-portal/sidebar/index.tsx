import config from '@automattic/calypso-config';
import { localize, translate as TranslateType } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import Sidebar from 'calypso/layout/sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import 'calypso/components/jetpack/sidebar/style.scss';

interface Props {
	path: string;
	dispatchRecordTracksEvent: typeof recordTracksEvent;
	translate: typeof TranslateType;
}
class PartnerPortalSidebar extends Component< Props > {
	onNavigate = ( menuItem: string ) => () => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
			menu_item: menuItem,
		} );

		window.scrollTo( 0, 0 );
	};

	render() {
		const { translate, path } = this.props;

		return (
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<SidebarMenu>
						<SidebarItem
							customIcon={
								<JetpackIcons
									icon={
										config.isEnabled( 'jetpack/partner-portal-payment' ) ? 'money' : 'credit-card'
									}
								/>
							}
							label={ translate( 'Billing', {
								comment: 'Jetpack sidebar navigation item',
							} ) }
							link="/partner-portal/billing"
							onNavigate={ this.onNavigate( 'Jetpack Cloud / Partner Portal' ) }
							selected={ path === '/partner-portal/billing' }
						/>

						<SidebarItem
							customIcon={ <JetpackIcons icon="licenses" /> }
							label={ translate( 'Licenses', {
								comment: 'Jetpack sidebar navigation item',
							} ) }
							link="/partner-portal/licenses"
							onNavigate={ this.onNavigate( 'Jetpack Cloud / Partner Portal / Licenses' ) }
							selected={ itemLinkMatches( '/partner-portal/licenses', path ) }
						/>

						{ config.isEnabled( 'jetpack/partner-portal-payment' ) && (
							<SidebarItem
								customIcon={ <JetpackIcons icon="credit-card" /> }
								label={ translate( 'Payment Methods', {
									comment: 'Jeptack sidebar navigation item',
								} ) }
								link="/partner-portal/payment-methods"
								onNavigate={ this.onNavigate( 'Jetpack Cloud / Partner Portal / Payment Methods' ) }
								selected={ itemLinkMatches( '/partner-portal/payment-methods', path ) }
							/>
						) }

						{ config.isEnabled( 'jetpack/partner-portal-payment' ) && (
							<SidebarItem
								customIcon={ <JetpackIcons icon="page" /> }
								label={ translate( 'Invoices', {
									comment: 'Jeptack sidebar navigation item',
								} ) }
								link="/partner-portal/invoices"
								onNavigate={ this.onNavigate( 'Jetpack Cloud / Partner Portal / Invoices' ) }
								selected={ itemLinkMatches( '/partner-portal/invoices', path ) }
							/>
						) }

						{ config.isEnabled( 'jetpack/partner-portal-payment' ) && (
							<SidebarItem
								customIcon={ <JetpackIcons icon="settings" /> }
								label={ translate( 'Company Details', {
									comment: 'Jeptack sidebar navigation item',
								} ) }
								link="/partner-portal/company-details"
								onNavigate={ this.onNavigate( 'Jetpack Cloud / Partner Portal / Company Details' ) }
								selected={ itemLinkMatches( '/partner-portal/company-details', path ) }
							/>
						) }
					</SidebarMenu>
				</SidebarRegion>
			</Sidebar>
		);
	}
}

export default connect( null, {
	dispatchRecordTracksEvent: recordTracksEvent,
} )( localize( PartnerPortalSidebar ) );
