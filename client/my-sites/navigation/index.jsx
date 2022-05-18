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
		if ( config.isEnabled( 'jetpack-cloud' ) ) {
			asyncSidebar = <AsyncLoad require="calypso/components/jetpack/sidebar" { ...asyncProps } />;
		} else {
			asyncSidebar = <AsyncLoad require="calypso/my-sites/sidebar" { ...asyncProps } />;
		}

		return (
			<div>
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onClose={ this.preventPickerDefault }
				/>
				{ asyncSidebar }
			</div>
		);
	}
}

export default MySitesNavigation;
