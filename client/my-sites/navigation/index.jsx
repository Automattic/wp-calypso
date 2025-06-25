import config from '@automattic/calypso-config';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import GlobalSidebar, { GLOBAL_SIDEBAR_EVENTS } from 'calypso/layout/global-sidebar';
import MySitesSidebarUnifiedBody from 'calypso/my-sites/sidebar/body';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSidebarType, SidebarType } from 'calypso/state/global-sidebar/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class MySitesNavigation extends Component {
	static displayName = 'MySitesNavigation';

	handleGlobalSidebarMenuItemClick = ( path ) => {
		this.props.recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.MENU_ITEM_CLICK, {
			section: 'sites',
			path: path.replace( this.props.siteDomain, ':site' ),
		} );
	};

	renderSidebar() {
		const asyncProps = {
			placeholder: null,
			path: this.props.path,
			siteBasePath: this.props.siteBasePath,
			isUnifiedSiteSidebarVisible: this.props.isUnifiedSiteSidebarVisible,
		};

		let asyncSidebar = null;

		if ( config.isEnabled( 'jetpack-cloud' ) ) {
			asyncSidebar = (
				<AsyncLoad
					require="calypso/jetpack-cloud/sections/sidebar-navigation/manage-selected-site"
					{ ...asyncProps }
				/>
			);
		} else if ( this.props.isGlobalSidebarVisible ) {
			return this.renderGlobalSidebar();
		} else {
			asyncSidebar = <AsyncLoad require="calypso/my-sites/sidebar" { ...asyncProps } />;
		}

		return <div className="my-sites__navigation">{ asyncSidebar }</div>;
	}

	renderGlobalSidebar() {
		const asyncProps = {
			placeholder: null,
			path: this.props.path,
		};
		return (
			<GlobalSidebar { ...asyncProps }>
				<MySitesSidebarUnifiedBody
					isGlobalSidebarCollapsed={ this.props.isGlobalSidebarCollapsed }
					path={ this.props.path }
					onMenuItemClick={ this.handleGlobalSidebarMenuItemClick }
				/>
			</GlobalSidebar>
		);
	}

	render() {
		return this.renderSidebar();
	}
}

export default withCurrentRoute(
	connect(
		( state, { currentSection, currentRoute } ) => {
			const siteId = getSelectedSiteId( state );
			const siteDomain = getSiteDomain( state, siteId );

			const sidebarType = getSidebarType( {
				state,
				siteId,
				section: currentSection,
				route: currentRoute,
			} );

			const shouldShowGlobalSidebar =
				sidebarType === SidebarType.Global || sidebarType === SidebarType.GlobalCollapsed;
			const shouldShowCollapsedGlobalSidebar = sidebarType === SidebarType.GlobalCollapsed;
			const shouldShowUnifiedSiteSidebar = sidebarType === SidebarType.UnifiedSiteClassic;

			return {
				siteDomain,
				isGlobalSidebarVisible: shouldShowGlobalSidebar,
				isGlobalSidebarCollapsed: shouldShowCollapsedGlobalSidebar,
				isUnifiedSiteSidebarVisible: shouldShowUnifiedSiteSidebar,
			};
		},
		{
			recordTracksEvent,
		}
	)( MySitesNavigation )
);
