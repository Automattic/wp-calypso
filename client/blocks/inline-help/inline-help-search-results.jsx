/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { identity, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import getInlineHelpApiResultsForQuery from 'state/inline-help/selectors/get-inline-help-api-results-for-query';
import getInlineHelpAdminResultsForQuery from 'state/inline-help/selectors/get-inline-help-admin-results-for-query';
import getInlineHelpContextualResultsForQuery from 'state/inline-help/selectors/get-inline-help-contextual-results-for-query';
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
	apiResults,
	adminResults,
	contextualResults,
	selectedResultIndex = -1,
	selectSearchResult,
	translate = identity,
	placeholderLines,
} ) {
	const selectResultHandler = ( selectionIndex ) => ( event ) => {
		const selectedResult = apiResults?.[ selectionIndex ] ?? null;
		selectSearchResult( selectionIndex );
		openResult( event, selectedResult );
	};

	const renderHelpLink = ( { link, key, description, title, icon }, index ) => {
		const classes = classNames( 'inline-help__results-item', {
			'is-selected': selectedResultIndex === index,
		} );

		return (
			<li key={ link ?? key } className={ classes }>
				<a
					href={ localizeUrl( link ) }
					onClick={ selectResultHandler( index ) }
					title={ decodeEntities( description ) }
					tabIndex={ -1 }
				>
					{ icon && <Gridicon icon={ icon } size={ 18 } /> }
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
			<div className="inline-help__search-results">
				{ ! isEmpty( searchQuery ) && ! hasAPIResults && (
					<p className="inline-help__empty-results">{
						translate( 'Sorry, there were no matches. Here are some of the most searched for help pages for this section:'
						) }
					</p>
				) }
				<ul className="inline-help__results-list">
					{ ! hasAPIResults && ( contextualResults.map( renderHelpLink ) ) }
					{ hasAPIResults && apiResults.map( renderHelpLink ) }
					{ ! isEmpty( adminResults ) && adminResults.map( renderHelpLink ) }
				</ul>
			</div>
		);
	};

	return (
		<>
			<QueryInlineHelpSearch query={ searchQuery } />
			{ renderSearchResults() }
		</>
	);
}

HelpSearchResults.propTypes = {
	translate: PropTypes.func,
	searchQuery: PropTypes.string,
	openResult: PropTypes.func.isRequired,
	hasAPIResults: PropTypes.bool,
	apiResults: PropTypes.array,
	adminResults: PropTypes.array,
	contextualResults: PropTypes.array,
	selectedResultIndex: PropTypes.number,
	isSearching: PropTypes.bool,
};

export default connect(
	( state, ownProps ) => ( {
		apiResults: getInlineHelpApiResultsForQuery( state ),
		adminResults: getInlineHelpAdminResultsForQuery( state ),
		contextualResults: getInlineHelpContextualResultsForQuery( state ),
		isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
		selectedResultIndex: getSelectedResultIndex( state ),
		hasAPIResults: hasInlineHelpAPIResults( state ),
	} ),
	{
		recordTracksEvent,
		selectSearchResult: selectResult,
	}
)( localize( HelpSearchResults ) );
