/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingUserSuggestions as isRequesting } from 'calypso/state/users/suggestions/selectors';
import { requestUserSuggestions } from 'calypso/state/users/suggestions/actions';

class QueryUsersSuggestions extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		isRequesting: PropTypes.bool,
		requestUserSuggestions: PropTypes.func,
	};

	static defaultProps = {
		requestUserSuggestions: () => {},
		isRequesting: false,
	};

	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.isRequesting || ! props.siteId ) {
			return;
		}

		props.requestUserSuggestions( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			isRequesting: isRequesting( state, ownProps.siteId ),
		};
	},
	{ requestUserSuggestions }
)( QueryUsersSuggestions );
