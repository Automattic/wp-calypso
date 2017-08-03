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
import { isRequestingReaderTeams } from 'state/selectors';

class QueryReaderTeams extends Component {
	componentWillMount() {
		if ( this.props.isRequesting ) {
			return;
		}

		this.props.requestTeams();
	}

	render() {
		return null;
	}
}

QueryReaderTeams.propTypes = {
	isRequesting: PropTypes.bool,
	request: PropTypes.func
};

const mapStateToProps = state => ( {
	requesting: isRequestingReaderTeams( state )
} );

const mapDispatchToProps = dispatch =>
	bindActionCreators( { requestTeams }, dispatch );

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)( QueryReaderTeams );
