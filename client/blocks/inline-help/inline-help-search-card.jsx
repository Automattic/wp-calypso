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
import {
	setInlineHelpSearchQuery,
	selectNextResult,
	selectPreviousResult,
} from 'state/inline-help/actions';
import { SUPPORT_TYPE_ADMIN_SECTION } from './constants';

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

	const onKeyDown = ( event ) => {
		// ignore keyboard access when manipulating a text selection in input etc.
		if ( event.getModifierState( 'Shift' ) ) {
			return;
		}
		// take over control if and only if it's one of our keys
		if ( includes( [ 'ArrowUp', 'ArrowDown', 'Enter' ], event.key ) ) {
			event.preventDefault();
		} else {
			return;
		}

		switch ( event.key ) {
			case 'ArrowUp':
				setPreviousResult();
				break;
			case 'ArrowDown':
				setNextResult();
				break;
			case 'Enter': {
				// check and catch admin section links.
				const { support_type: supportType, link } = selectedResult;
				if ( supportType === SUPPORT_TYPE_ADMIN_SECTION && link ) {
					track( 'calypso_inlinehelp_admin_section_visit', {
						link: link,
						search_term: query,
					} );

					// push state only if it's internal link.
					if ( ! /^http/.test( link ) ) {
						event.preventDefault();
						page( link );
					} else {
						// redirect external links.
						window.location.href = link;
					}

					return;
				}

				selectedResultIndex >= 0 && onSelect( event );
				break;
			}
		}
	};

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
			onKeyDown={ onKeyDown }
			placeholder={ placeholder || translate( 'Search for help…' ) }
			delaySearch={ true }
		/>
	);
};

InlineHelpSearchCard.propTypes = {
	onSelect: PropTypes.func.isRequired,
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
	setNextResult: selectNextResult,
	setPreviousResult: selectPreviousResult,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchCard ) );
