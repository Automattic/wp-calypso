/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostFormats } from 'state/post-formats/actions';
import { isRequestingPostFormats } from 'state/post-formats/selectors';

class QueryPostFormats extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingPostFormats: PropTypes.bool,
		requestPostFormats: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingPostFormats ) {
			return;
		}

		props.requestPostFormats( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingPostFormats: isRequestingPostFormats( state, ownProps.siteId )
		};
	},
	{ requestPostFormats }
)( QueryPostFormats );
