/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import SitePicker from 'calypso/my-sites/picker';
import AsyncLoad from 'calypso/components/async-load';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';

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
			asyncSidebar = <AsyncLoad require="calypso/components/jetpack/sidebar" { ...asyncProps } />;
		} else if ( this.props.isNavUnificationEnabled ) {
			asyncSidebar = <AsyncLoad require="calypso/my-sites/sidebar-unified" { ...asyncProps } />;
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

export default connect( ( state ) => ( {
	isNavUnificationEnabled: isNavUnificationEnabled( state ),
} ) )( MySitesNavigation );
