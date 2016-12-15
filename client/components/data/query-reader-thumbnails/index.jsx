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
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.embedUrl !== this.props.embedUrl ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( ! props.shouldRequestThumbnail || ! props.embedUrl ) {
			return;
		}
		props.requestThumbnail( props.embedUrl );
	}

	render() {
		return null;
	}
}

QueryReaderThumbnails.propTypes = {
	shouldRequestThumbnail: PropTypes.bool,
	requestThumbnail: PropTypes.func
};

const mapStateToProps = ( state, ownProps ) => ( {
	shouldRequestThumbnail: ! getThumbnailForIframe( state, ownProps.embedUrl ),
} );

const mapDispatchToProps = ( dispatch ) => (
	bindActionCreators( { requestThumbnail }, dispatch )
);

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)( QueryReaderThumbnails );
