/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isFetchingVideo } from 'state/videos/selectors';
import { fetchVideo } from 'state/videos/actions';

class QueryVideo extends Component {

	componentWillMount() {
		if ( ! this.props.fetchingVideo ) {
			this.props.fetchVideo( this.props.guid );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.fetchingVideo || ( this.props.guid === nextProps.guid ) ) {
			return;
		}
		nextProps.fetchVideo( nextProps.guid );
	}

	render() {
		return null;
	}
}

QueryVideo.propTypes = {
	guid: PropTypes.string,
	fetchingVideo: PropTypes.bool,
	fetchVideo: PropTypes.func
};

QueryVideo.defaultProps = {
	fetchVideo: () => {}
};

export default connect(
	( state, props ) => {
		const guid = props.guid;
		return {
			fetchingVideo: isFetchingVideo( state, guid )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			fetchVideo
		}, dispatch );
	}
)( QueryVideo );
