/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchUserSettings } from 'calypso/state/user-settings/actions';

class QueryUserSettings extends Component {
	UNSAFE_componentWillMount() {
		this.props.fetchUserSettings();
	}

	render() {
		return null;
	}
}

export default connect( null, { fetchUserSettings } )( QueryUserSettings );
