/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import SitePicker from 'my-sites/picker';
import AsyncLoad from 'components/async-load';

class MySitesNavigation extends React.Component {
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
			asyncSidebar = <AsyncLoad require="components/jetpack/sidebar" { ...asyncProps } />;
		} else if ( config.isEnabled( 'nav-unification' ) ) {
			asyncSidebar = <AsyncLoad require="my-sites/sidebar-unified/switcher" { ...asyncProps } />;
		} else {
			asyncSidebar = <AsyncLoad require="my-sites/sidebar" { ...asyncProps } />;
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
