/**
 * External dependencies
 */

import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { fetchUserSettings } from 'state/user-settings/actions';

class QueryUserSettings extends Component {
	static propTypes = {
		onError: PropTypes.func,
	};

	UNSAFE_componentWillMount() {
		this.props.fetchUserSettings( this.props.onError );
	}

	render() {
		return null;
	}
}

export default connect( null, { fetchUserSettings } )( QueryUserSettings );
