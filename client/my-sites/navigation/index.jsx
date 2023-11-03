import config from '@automattic/calypso-config';
import { Component } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import SitePicker from 'calypso/my-sites/picker';

class MySitesNavigation extends Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
	};

	render() {
		const asyncProps = {
			placeholder: null,
			path: this.props.path,
			siteBasePath: this.props.siteBasePath,
		};

		let asyncSidebar = null;
		let showSitePicker = true;
		let sitePickerProps = {};

		if ( config.isEnabled( 'jetpack-cloud' ) ) {
			if ( config.isEnabled( 'jetpack/new-navigation' ) ) {
				asyncSidebar = (
					<AsyncLoad
						require="calypso/jetpack-cloud/sections/sidebar-navigation/manage-selected-site"
						{ ...asyncProps }
					/>
				);

				// For the new Jetpack cloud sidebar, it has its own site picker.
				showSitePicker = false;
			} else {
				asyncSidebar = <AsyncLoad require="calypso/components/jetpack/sidebar" { ...asyncProps } />;
			}

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
				{ showSitePicker && (
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
}

export default MySitesNavigation;
