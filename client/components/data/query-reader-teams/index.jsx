/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTeams } from 'state/reader/teams/actions';

class QueryReaderTeams extends Component {
	componentWillMount() {
		this.props.requestTeams();
	}

	render() {
		return null;
	}
}

QueryReaderTeams.propTypes = {
	request: PropTypes.func
};

export default connect(
	null,
	{ requestTeams },
)( QueryReaderTeams );
