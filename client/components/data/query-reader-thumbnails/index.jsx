import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestThumbnail } from 'calypso/state/reader/thumbnails/actions';
import { getThumbnailForIframe } from 'calypso/state/reader/thumbnails/selectors';

class QueryReaderThumbnails extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
