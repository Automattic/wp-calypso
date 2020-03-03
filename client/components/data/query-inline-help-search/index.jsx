/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestInlineHelpSearchResults } from 'state/inline-help/actions';
import { isRequestingInlineHelpSearchResultsForQuery } from 'state/inline-help/selectors';

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
		if ( props.requesting || ! props.query ) {
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
