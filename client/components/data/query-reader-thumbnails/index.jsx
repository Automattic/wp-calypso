/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { getThumbnailForIframe } from 'state/reader/thumbnails/selectors';
import { requestThumbnail } from 'state/reader/thumbnails/actions';

class QueryReaderThumbnails extends Component {
	componentWillMount() {
		if ( ! this.props.shouldRequestThumbnail || ! this.props.embedUrl ) {
			return;
		}
		this.props.requestThumbnail( this.props.embedUrl );
	}

	render() {
		return null;
	}
}

QueryReaderThumbnails.propTypes = {
	shouldRequestThumbnail: PropTypes.bool,
	requestThumbnail: PropTypes.func
};

export default connect(
	( state, ownProps ) => {
		return {
			shouldRequestThumbnail: ! getThumbnailForIframe( state, ownProps.embedUrl )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestThumbnail
		}, dispatch );
	}
)( QueryReaderThumbnails );
