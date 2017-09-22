/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestUserSuggestions } from 'state/users/suggestions/actions';
import { isRequestingUserSuggestions as isRequesting } from 'state/users/suggestions/selectors';

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

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
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
			isRequesting: isRequesting( state, ownProps.siteId )
		};
	},
	{ requestUserSuggestions }
)( QueryUsersSuggestions );
