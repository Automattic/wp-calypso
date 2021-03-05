/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestInlineHelpSearchResults } from 'calypso/state/inline-help/actions';
import isRequestingInlineHelpSearchResultsForQuery from 'calypso/state/inline-help/selectors/is-requesting-inline-help-search-results-for-query';

class QueryInlineHelpSearch extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.query === nextProps.query ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting ) {
			return;
		}

		props.requestInlineHelpSearchResults( props.query );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { query } ) => {
		return {
			requesting: isRequestingInlineHelpSearchResultsForQuery( state, query ),
		};
	},
	{ requestInlineHelpSearchResults }
)( QueryInlineHelpSearch );
