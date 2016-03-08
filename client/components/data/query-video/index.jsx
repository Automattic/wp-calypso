/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingVideo } from 'state/videos/selectors';
import { requestVideo } from 'state/videos/actions';

class QueryVideo extends Component {

	componentWillMount() {
		if ( ! this.props.requestingVideo ) {
			this.props.requestVideo( this.props.guid );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingVideo || ( this.props.guid === nextProps.guid ) ) {
			return;
		}
		nextProps.requestVideo( nextProps.guid );
	}

	render() {
		return null;
	}
}

QueryVideo.propTypes = {
	guid: PropTypes.string,
	requestingVideo: PropTypes.bool,
	requestVideo: PropTypes.func
};

QueryVideo.defaultProps = {
	requestVideo: () => {}
};

export default connect(
	( state, props ) => {
		const guid = props.guid;
		return {
			requestingVideo: isRequestingVideo( state, guid )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestVideo
		}, dispatch );
	}
)( QueryVideo );
