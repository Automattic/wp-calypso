/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingRecommendations, getRecommendationsInteractedWith } from 'state/reader/start/selectors';
import { requestRecommendations } from 'state/reader/start/actions';

class QueryReaderStartRecommendations extends Component {
	componentWillMount() {
		if ( this.props.isRequestingRecommendations ) {
			return;
		}

		this.props.requestRecommendations( this.props.getRecommendationsInteractedWith );
	}

	render() {
		return null;
	}
}

QueryReaderStartRecommendations.propTypes = {
	isRequestingRecommendations: PropTypes.bool,
	requestRecommendations: PropTypes.func
};

QueryReaderStartRecommendations.defaultProps = {
	requestRecommendations: () => {}
};

export default connect(
	( state ) => {
		return {
			isRequestingRecommendations: isRequestingRecommendations( state ),
			getRecommendationsInteractedWith: getRecommendationsInteractedWith( state )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestRecommendations
		}, dispatch );
	}
)( QueryReaderStartRecommendations );
