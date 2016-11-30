/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingTagImages } from 'state/reader/tags/images/selectors';
import { requestTagImages } from 'state/reader/tags/images/actions';

class QueryReaderTagImages extends Component {
	componentWillMount() {
		if ( this.props.isRequestingTagImages || ! this.props.tag ) {
			return;
		}

		this.props.requestTagImages( this.props.tag );
	}

	render() {
		return null;
	}
}

QueryReaderTagImages.propTypes = {
	isRequestingTagImages: PropTypes.bool,
	requestTagImages: PropTypes.func
};

QueryReaderTagImages.defaultProps = {
	requestTagImages: () => {}
};

export default connect(
	( state, ownProps ) => {
		return {
			isRequestingTagImages: isRequestingTagImages( state, ownProps.tag )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestTagImages
		}, dispatch );
	}
)( QueryReaderTagImages );
