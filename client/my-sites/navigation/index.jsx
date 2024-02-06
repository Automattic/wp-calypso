import config from '@automattic/calypso-config';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import { useGlobalSidebar } from 'calypso/layout/global-sidebar/hooks/use-global-sidebar';
import SitePicker from 'calypso/my-sites/picker';
import MySitesSidebarUnifiedBody from 'calypso/my-sites/sidebar/body';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class MySitesNavigation extends Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
	};

	renderSidebar() {
		const asyncProps = {
			placeholder: null,
			path: this.props.path,
			siteBasePath: this.props.siteBasePath,
			shouldShowGlobalSidebar: this.props.shouldShowGlobalSidebar,
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
		const asyncSidebar = (
			<AsyncLoad require="calypso/layout/global-sidebar" { ...asyncProps }>
				<MySitesSidebarUnifiedBody path={ this.props.path } />
			</AsyncLoad>
		);
		return <div className="my-sites__navigation global-sidebar">{ asyncSidebar }</div>;
	}

	render() {
		if ( this.props.isGlobalSidebarVisible ) {
			return this.renderGlobalSidebar();
		}
		return this.renderSidebar();
	}
}

export default withCurrentRoute(
	connect( ( state, { currentSection } ) => {
		const sectionGroup = currentSection?.group ?? null;
		const siteId = getSelectedSiteId( state );
		const { shouldShowGlobalSidebar } = useGlobalSidebar( siteId, sectionGroup );
		return {
			isGlobalSidebarVisible: shouldShowGlobalSidebar,
		};
	}, null )( MySitesNavigation )
);
