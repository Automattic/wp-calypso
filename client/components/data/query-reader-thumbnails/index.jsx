/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getThumbnailForIframe } from 'calypso/state/reader/thumbnails/selectors';
import { requestThumbnail } from 'calypso/state/reader/thumbnails/actions';

class QueryReaderThumbnails extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
	requestThumbnail: PropTypes.func,
};

const mapStateToProps = ( state, ownProps ) => ( {
	shouldRequestThumbnail: ! getThumbnailForIframe( state, ownProps.embedUrl ),
} );

export default connect( mapStateToProps, { requestThumbnail } )( QueryReaderThumbnails );
