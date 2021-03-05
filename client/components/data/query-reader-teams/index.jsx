/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTeams } from 'calypso/state/teams/actions';

class QueryReaderTeams extends Component {
	UNSAFE_componentWillMount() {
		this.props.requestTeams();
	}

	render() {
		return null;
	}
}

QueryReaderTeams.propTypes = {
	request: PropTypes.func,
};

export default connect( null, { requestTeams } )( QueryReaderTeams );
