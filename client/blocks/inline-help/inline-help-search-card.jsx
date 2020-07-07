/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, includes } from 'lodash';
import page from 'page';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import SearchCard from 'components/search-card';
import getInlineHelpCurrentlySelectedLink from 'state/inline-help/selectors/get-inline-help-currently-selected-link';
import getSelectedResultIndex from 'state/inline-help/selectors/get-selected-result-index';
import isRequestingInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/is-requesting-inline-help-search-results-for-query';
import getInlineHelpCurrentlySelectedResult from 'state/inline-help/selectors/get-inline-help-currently-selected-result';
import { setInlineHelpSearchQuery } from 'state/inline-help/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:inline-help' );

const InlineHelpSearchCard = ( {
	setPreviousResult,
	setNextResult,
	selectedResultIndex,
	selectedResult = {},
	query = '',
	onSelect,
	track,
	location = 'inline-help-popover',
	setSearchQuery,
	isSearching,
	placeholder,
	translate = identity,
} ) => {
	const cardRef = useRef();

	// Focus in the input element.
	useEffect( () => {
		const inputElement = cardRef.current?.searchInput;
		// Focuses only in the popover.
		if ( location !== 'inline-help-popover' || ! inputElement ) {
			return;
		}

		const timerId = setTimeout( () => inputElement.focus(), 0 );

		return () => window.clearTimeout( timerId );
	}, [ cardRef, location ] );

	const searchHelperHandler = ( searchQuery ) => {
		const inputQuery = searchQuery.trim();

		if ( inputQuery?.length ) {
			debug( 'search query received: ', searchQuery );
			track( 'calypso_inlinehelp_search', {
				search_query: searchQuery,
				location: location,
			} );
		}

		// Set the query search
		setSearchQuery( searchQuery );
	};

	return (
		<SearchCard
			ref={ cardRef }
			searching={ isSearching }
			initialValue={ query }
			onSearch={ searchHelperHandler }
			placeholder={ placeholder || translate( 'Search for help…' ) }
			delaySearch={ true }
		/>
	);
};

InlineHelpSearchCard.propTypes = {
	onSelect: PropTypes.func,
	translate: PropTypes.func,
	track: PropTypes.func,
	query: PropTypes.string,
	placeholder: PropTypes.string,
	location: PropTypes.string,
	selectedResult: PropTypes.object,
};

const mapStateToProps = ( state, ownProps ) => ( {
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.query ),
	selectedLink: getInlineHelpCurrentlySelectedLink( state ),
	selectedResultIndex: getSelectedResultIndex( state ),
	selectedResult: getInlineHelpCurrentlySelectedResult( state ),
} );
const mapDispatchToProps = {
	track: recordTracksEvent,
	setSearchQuery: setInlineHelpSearchQuery,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchCard ) );
