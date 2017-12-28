/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingPostFormats } from 'client/state/post-formats/selectors';
import { requestPostFormats } from 'client/state/post-formats/actions';

class QueryPostFormats extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingPostFormats: PropTypes.bool,
		requestPostFormats: PropTypes.func,
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
			requestingPostFormats: isRequestingPostFormats( state, ownProps.siteId ),
		};
	},
	{ requestPostFormats }
)( QueryPostFormats );
