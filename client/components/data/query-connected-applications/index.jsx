/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestConnectedApplications } from 'calypso/state/connected-applications/actions';

class QueryConnectedApplications extends Component {
	static propTypes = {
		requestConnectedApplications: PropTypes.func,
	};

	componentDidMount() {
		this.props.requestConnectedApplications();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestConnectedApplications } )( QueryConnectedApplications );
