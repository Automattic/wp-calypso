/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, translate as TranslateType } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Sidebar from 'calypso/layout/sidebar';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';

/**
 * Style dependencies
 */
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
							materialIcon="credit_card"
							materialIconStyle="outline"
							label={ translate( 'Billing', {
								comment: 'Jetpack sidebar navigation item',
							} ) }
							link="/partner-portal"
							onNavigate={ this.onNavigate( 'Jetpack Cloud / Partner Portal' ) }
							selected={ path === '/partner-portal' }
						/>

						<SidebarItem
							materialIcon="vpn_key"
							materialIconStyle="filled"
							label={ translate( 'Licenses', {
								comment: 'Jetpack sidebar navigation item',
							} ) }
							link="/partner-portal/licenses"
							onNavigate={ this.onNavigate( 'Jetpack Cloud / Partner Portal / Licenses' ) }
							selected={ itemLinkMatches( [ '/partner-portal/licenses' ], path ) }
						/>
					</SidebarMenu>
				</SidebarRegion>
			</Sidebar>
		);
	}
}

export default connect( null, {
	dispatchRecordTracksEvent: recordTracksEvent,
} )( localize( PartnerPortalSidebar ) );
