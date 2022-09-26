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
		let showManageSitesButton = null;
		let showHiddenSites = null;

		if ( config.isEnabled( 'jetpack-cloud' ) ) {
			asyncSidebar = <AsyncLoad require="calypso/components/jetpack/sidebar" { ...asyncProps } />;
			showManageSitesButton = false;
			showHiddenSites = false;
		} else {
			asyncSidebar = <AsyncLoad require="calypso/my-sites/sidebar" { ...asyncProps } />;
			showManageSitesButton = true;
			showHiddenSites = true;
		}

		return (
			<div>
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onClose={ this.preventPickerDefault }
					showManageSitesButton={ showManageSitesButton }
					showHiddenSites={ showHiddenSites }
				/>
				{ asyncSidebar }
			</div>
		);
	}
}

export default MySitesNavigation;
