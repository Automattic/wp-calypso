/**
 * External dependencies
 */

import React from 'react';
import config from 'config';

/**
 * Internal dependencies
 */
import SitePicker from 'my-sites/picker';
import Sidebar from 'my-sites/sidebar';
import JetpackCloudSidebar from 'landing/jetpack-cloud/components/sidebar';

class MySitesNavigation extends React.Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = event => {
		event.preventDefault();
		event.stopPropagation();
	};

	renderSidebar() {
		if ( 'jetpack-cloud' === config( 'sidebar' ) ) {
			return (
				<JetpackCloudSidebar path={ this.props.path } siteBasePath={ this.props.siteBasePath } />
			);
		}
		return <Sidebar path={ this.props.path } siteBasePath={ this.props.siteBasePath } />;
	}

	render() {
		return (
			<div>
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onClose={ this.preventPickerDefault }
				/>
				{ this.renderSidebar() }
			</div>
		);
	}
}

export default MySitesNavigation;
