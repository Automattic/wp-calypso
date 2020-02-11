/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getApplication } from 'state/ui/selectors';
import SitePicker from 'my-sites/picker';
import Sidebar from 'my-sites/sidebar';
import { default as JetpackCloudSidebar } from 'landing/jetpack-cloud/components/sidebar';

class MySitesNavigation extends React.Component {
	static displayName = 'MySitesNavigation';

	preventPickerDefault = event => {
		event.preventDefault();
		event.stopPropagation();
	};

	render() {
		let sidebar = null;
		if ( 'jetpack-cloud' === this.props.application ) {
			sidebar = (
				<JetpackCloudSidebar path={ this.props.path } siteBasePath={ this.props.siteBasePath } />
			);
		} else {
			sidebar = <Sidebar path={ this.props.path } siteBasePath={ this.props.siteBasePath } />;
		}
		return (
			<div>
				<SitePicker
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					onClose={ this.preventPickerDefault }
				/>
				{ sidebar }
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		application: getApplication( state ),
	};
};

export default connect( mapStateToProps )( MySitesNavigation );
