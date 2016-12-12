/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingUserSuggestions as isRequesting } from 'state/users/suggestions/selectors';
import { requestUserSuggestions } from 'state/users/suggestions/actions';

class QueryUsersSuggestions extends Component {
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
		if ( props.isRequesting ) {
			return;
		}

		props.requestUserSuggestions( props.siteId );
	}

	render() {
		return null;
	}
}

QueryUsersSuggestions.propTypes = {
	siteId: PropTypes.number,
	isRequesting: PropTypes.bool,
	requestUserSuggestions: PropTypes.func
};

QueryUsersSuggestions.defaultProps = {
	requestUserSuggestions: () => {},
	isRequesting: false
};

export default connect(
	( state, ownProps ) => {
		return {
			isRequesting: isRequesting( state, ownProps.siteId )
		};
	},
	{ requestUserSuggestions }
)( QueryUsersSuggestions );
