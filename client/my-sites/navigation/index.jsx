import config from '@automattic/calypso-config';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { useCurrentRoute } from 'calypso/components/route';
import SitePicker from 'calypso/my-sites/picker';
import { useGlobalSidebar } from 'calypso/my-sites/sidebar/hooks/use-global-sidebar';
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
			siteBasePath: this.props.siteBasePath,
			shouldShowGlobalSidebar: this.props.isGlobalSidebarVisible,
		};

		const asyncSidebar = <AsyncLoad require="calypso/my-sites/sidebar" { ...asyncProps } />;
		return <div className="my-sites__navigation global-sidebar">{ asyncSidebar }</div>;
	}

	render() {
		if ( this.props.isGlobalSidebarVisible ) {
			return this.renderGlobalSidebar();
		}
		return this.renderSidebar();
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const { sectionGroup } = useCurrentRoute();
	const { shouldShowGlobalSidebar } = useGlobalSidebar( siteId, sectionGroup );
	return {
		isGlobalSidebarVisible: shouldShowGlobalSidebar,
	};
}, null )( MySitesNavigation );
