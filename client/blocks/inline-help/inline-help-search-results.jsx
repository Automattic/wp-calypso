/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { identity, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import getInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/get-inline-help-search-results-for-query';
import getSelectedResultIndex from 'state/inline-help/selectors/get-selected-result-index';
import isRequestingInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/is-requesting-inline-help-search-results-for-query';
import hasInlineHelpAPIResults from 'state/selectors/has-inline-help-api-results';
import { selectResult } from 'state/inline-help/actions';
import { localizeUrl } from 'lib/i18n-utils';

function HelpSearchResults( {
	hasAPIResults = false,
	isSearching = false,
	openResult,
	searchQuery = '',
	searchResults,
	selectedResultIndex = -1,
	selectSearchResult,
	translate = identity,
	placeholderLines,
} ) {
	const selectResultHandler = ( selectionIndex ) => ( event ) => {
		const selectedResult = searchResults?.[ selectionIndex ] ?? null;
		selectSearchResult( selectionIndex );
		openResult( event, selectedResult );
	};

	const renderHelpLink = ( { link, key, description, title }, index ) => {
		const classes = classNames( 'inline-help__results-item', {
			'is-selected': selectedResultIndex === index,
		} );

		return (
			<li key={ link ?? key } className={ classes }>
				<a
					href={ localizeUrl( link ) }
					onClick={ selectResultHandler( index ) }
					title={ decodeEntities( description ) }
				>
					{ preventWidows( decodeEntities( title ) ) }
				</a>
			</li>
		);
	};

	const renderSearchResults = () => {
		if ( isSearching ) {
			// search, but no results so far
			return <PlaceholderLines lines={ placeholderLines } />;
		}

		return (
			<>
				{ ! isEmpty( searchQuery ) && ! hasAPIResults && (
					<p className="inline-help__empty-results">{ translate( 'No results.' ) }</p>
				) }
				<ul className="inline-help__results-list">{ searchResults.map( renderHelpLink ) }</ul>
			</>
		);
	};

	return (
		<div>
			<QueryInlineHelpSearch query={ searchQuery } requesting={ isSearching } />
			{ renderSearchResults() }
		</div>
	);
}

HelpSearchResults.propTypes = {
	translate: PropTypes.func,
	searchQuery: PropTypes.string,
	openResult: PropTypes.func.isRequired,
	hasAPIResults: PropTypes.bool,
	searchResults: PropTypes.array,
	selectedResultIndex: PropTypes.number,
	isSearching: PropTypes.bool,
};

export default connect(
	( state, ownProps ) => ( {
		searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
		isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
		selectedResultIndex: getSelectedResultIndex( state ),
		hasAPIResults: hasInlineHelpAPIResults( state ),
	} ),
	{
		recordTracksEvent,
		selectSearchResult: selectResult,
	}
)( localize( HelpSearchResults ) );
