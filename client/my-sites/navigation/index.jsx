import config from '@automattic/calypso-config';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import GlobalSidebar, { GLOBAL_SIDEBAR_EVENTS } from 'calypso/layout/global-sidebar';
import SitePicker from 'calypso/my-sites/picker';
import MySitesSidebarUnifiedBody from 'calypso/my-sites/sidebar/body';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getShouldShowCollapsedGlobalSidebar,
	getShouldShowGlobalSidebar,
	getShouldShowUnifiedSiteSidebar,
} from 'calypso/state/global-sidebar/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class MySitesNavigation extends Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
	};

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
		let renderSitePicker = true;
		let sitePickerProps = {};

		if ( config.isEnabled( 'jetpack-cloud' ) ) {
			asyncSidebar = (
				<AsyncLoad
					require="calypso/jetpack-cloud/sections/sidebar-navigation/manage-selected-site"
					{ ...asyncProps }
				/>
			);

			// For the new Jetpack cloud sidebar, it has its own site picker.
			renderSitePicker = false;

			sitePickerProps = {
				showManageSitesButton: false,
				showHiddenSites: false,
			};
		} else if ( this.props.isGlobalSidebarVisible ) {
			return this.renderGlobalSidebar();
		} else {
			asyncSidebar = <AsyncLoad require="calypso/my-sites/sidebar" { ...asyncProps } />;

			sitePickerProps = {
				showManageSitesButton: true,
				showHiddenSites: true,
				maxResults: 50,
			};
		}

		return (
			<div className="my-sites__navigation">
				{ renderSitePicker && (
					<SitePicker
						allSitesPath={ this.props.allSitesPath }
						siteBasePath={ this.props.siteBasePath }
						onClose={ this.preventPickerDefault }
						{ ...sitePickerProps }
					/>
				) }
				{ asyncSidebar }
			</div>
		);
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
		( state, { currentSection } ) => {
			const sectionGroup = currentSection?.group ?? null;
			const sectionName = currentSection?.name ?? null;
			const siteId = getSelectedSiteId( state );
			const siteDomain = getSiteDomain( state, siteId );
			const shouldShowGlobalSidebar = getShouldShowGlobalSidebar( state, siteId, sectionGroup );
			const shouldShowCollapsedGlobalSidebar = getShouldShowCollapsedGlobalSidebar(
				state,
				siteId,
				sectionGroup
			);
			const shouldShowUnifiedSiteSidebar = getShouldShowUnifiedSiteSidebar(
				state,
				siteId,
				sectionGroup,
				sectionName
			);
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
