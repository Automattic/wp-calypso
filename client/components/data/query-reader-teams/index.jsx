/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

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

const mapDispatchToProps = dispatch =>
	bindActionCreators( { requestTeams }, dispatch );

export default connect(
	null,
	mapDispatchToProps,
)( QueryReaderTeams );
