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
