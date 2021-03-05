/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPostFormats } from 'calypso/state/post-formats/selectors';
import { requestPostFormats } from 'calypso/state/post-formats/actions';

class QueryPostFormats extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingPostFormats: PropTypes.bool,
		requestPostFormats: PropTypes.func,
	};

	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
			requestingPostFormats: isRequestingPostFormats( state, ownProps.siteId ),
		};
	},
	{ requestPostFormats }
)( QueryPostFormats );
