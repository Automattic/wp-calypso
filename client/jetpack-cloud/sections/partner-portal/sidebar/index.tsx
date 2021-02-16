/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { memoize } from 'lodash';
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
// We import these styles from here because this is the only section that gets always
// loaded when a user visits Jetpack Cloud. We might have to find a better place for
// this in the future.
import 'calypso/jetpack-cloud/style.scss';

interface Props {
	path: string;
	dispatchRecordTracksEvent: typeof recordTracksEvent;
	translate: typeof TranslateType;
}

class PartnerPortalSidebar extends Component< Props > {
	onNavigate = memoize( ( menuItem ) => () => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
			menu_item: menuItem,
		} );

		window.scrollTo( 0, 0 );
	} );

	render() {
		const { translate, path } = this.props;

		return (
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<SidebarMenu>
						<SidebarItem
							materialIcon="vpn_key"
							materialIconStyle="filled"
							label={ translate( 'Licenses', {
								comment: 'Jetpack sidebar navigation item',
							} ) }
							link="/partner-portal"
							onNavigate={ this.onNavigate }
							selected={ itemLinkMatches( [ '/partner-portal' ], path ) }
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
