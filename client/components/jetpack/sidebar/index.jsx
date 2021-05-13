/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { format as formatUrl, getUrlParts, getUrlFromParts } from '@automattic/calypso-url';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import CurrentSite from 'calypso/my-sites/current-site';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import JetpackCloudSidebarMenuItems from './menu-items/jetpack-cloud';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string,
		threats: PropTypes.array,
	};

	onGetHelp = () => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
			menu_item: 'Jetpack Cloud / Support',
		} );

		window.scrollTo( 0, 0 );
	};

	render() {
		const { translate, jetpackAdminUrl, path } = this.props;

		return (
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<CurrentSite />
					<SidebarMenu>
						<JetpackCloudSidebarMenuItems path={ path } />
					</SidebarMenu>
				</SidebarRegion>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarItem
							label={ translate( 'Get help', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link="https://jetpack.com/support"
							materialIcon="help"
							materialIconStyle="filled"
							onNavigate={ this.onGetHelp }
						/>
						<SidebarItem
							label={ translate( 'WP Admin', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link={ jetpackAdminUrl }
							icon="my-sites"
						/>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		);
	}
}

const getJetpackAdminUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	if ( null === siteAdminUrl ) {
		return undefined;
	}

	const parts = getUrlParts( siteAdminUrl + 'admin.php' );
	parts.searchParams.set( 'page', 'jetpack' );

	return formatUrl( getUrlFromParts( parts ) );
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const jetpackAdminUrl = getJetpackAdminUrl( state, siteId );

		return {
			jetpackAdminUrl,
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,
	}
)( localize( JetpackCloudSidebar ) );
