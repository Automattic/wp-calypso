/**
 * External dependencies
 */
import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { debounce, identity, isEmpty, noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import page from 'page';
import { speak } from '@wordpress/a11y';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import QueryInlineHelpSearch from 'calypso/components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { getSectionName } from 'calypso/state/ui/selectors';
import getSearchResultsByQuery from 'calypso/state/inline-help/selectors/get-inline-help-search-results-for-query';
import getSelectedResultIndex from 'calypso/state/inline-help/selectors/get-selected-result-index';
import getInlineHelpCurrentlySelectedResult from 'calypso/state/inline-help/selectors/get-inline-help-currently-selected-result';
import isRequestingInlineHelpSearchResultsForQuery from 'calypso/state/inline-help/selectors/is-requesting-inline-help-search-results-for-query';
import hasInlineHelpAPIResults from 'calypso/state/selectors/has-inline-help-api-results';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { selectResult } from 'calypso/state/inline-help/actions';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import Gridicon from 'calypso/components/gridicon';
import {
	SUPPORT_TYPE_ADMIN_SECTION,
	SUPPORT_TYPE_API_HELP,
	SUPPORT_TYPE_CONTEXTUAL_HELP,
} from './constants';

function debounceSpeak( { message = '', priority = 'polite', timeout = 800 } ) {
	return debounce( () => {
		speak( message, priority );
	}, timeout );
}

const loadingSpeak = debounceSpeak( { message: 'Loading search results.', timeout: 1500 } );

const resultsSpeak = debounceSpeak( { message: 'Search results loaded.' } );

const errorSpeak = debounceSpeak( { message: 'No search results found.' } );

function HelpSearchResults( {
	currentUserId,
	hasAPIResults = false,
	hasPurchases,
	isSearching = false,
	onSelect,
	onAdminSectionSelect = noop,
	searchQuery = '',
	searchResults = [],
	sectionName,
	selectedResultIndex = -1,
	selectSearchResult,
	translate = identity,
	placeholderLines,
	track,
} ) {
	useEffect( () => {
		// Cancel all queued speak messages.
		loadingSpeak.cancel();
		resultsSpeak.cancel();
		errorSpeak.cancel();

		// If there's no query, then we don't need to announce anything.
		if ( isEmpty( searchQuery ) ) {
			return;
		}

		if ( isSearching ) {
			loadingSpeak();
		} else if ( ! hasAPIResults ) {
			errorSpeak();
		} else if ( hasAPIResults ) {
			resultsSpeak();
		}
	}, [ isSearching, hasAPIResults, searchQuery ] );

	function getTitleBySectionType( type, query = '' ) {
		let title = '';
		switch ( type ) {
			case SUPPORT_TYPE_CONTEXTUAL_HELP:
				if ( ! query.length ) {
					return null;
				}
				title = translate( 'This might interest you' );
				break;

			case SUPPORT_TYPE_API_HELP:
				title = translate( 'Support articles' );
				break;
			case SUPPORT_TYPE_ADMIN_SECTION:
				title = translate( 'Show me where to' );
				break;
			default:
				return null;
		}

		return title;
	}

	const onLinkClickHandler = ( event, result ) => {
		const { support_type: supportType, link } = result;
		// check and catch admin section links.
		if ( supportType === SUPPORT_TYPE_ADMIN_SECTION && link ) {
			// record track-event.
			track( 'calypso_inlinehelp_admin_section_visit', {
				link: link,
				search_term: searchQuery,
			} );

			// push state only if it's internal link.
			if ( ! /^http/.test( link ) ) {
				event.preventDefault();
				page( link );
				onAdminSectionSelect( event );
			}

			return;
		}

		onSelect( event, result );
	};

	const renderHelpLink = ( result ) => {
		const {
			link,
			key,
			title,
			support_type = SUPPORT_TYPE_API_HELP,
			icon = 'domains',
			post_id,
		} = result;
		const resultIndex = searchResults.findIndex( ( r ) => r.link === link );

		const classes = classNames( 'inline-help__results-item', {
			'is-selected': selectedResultIndex === resultIndex,
		} );

		// Unless searching with Inline Help or on the Purchases section, hide the
		// "Managing Purchases" documentation link for users who have not made a purchase.
		if (
			post_id === 111349 &&
			! isSearching &&
			! hasAPIResults &&
			! hasPurchases &&
			sectionName !== 'purchases' &&
			sectionName !== 'site-purchases'
		) {
			return null;
		}

		return (
			<Fragment key={ link ?? key }>
				<li className={ classes }>
					<div className="inline-help__results-cell">
						<a
							href={ localizeUrl( link ) }
							onClick={ ( event ) => {
								event.preventDefault();
								selectSearchResult( resultIndex );
								onLinkClickHandler( event, result );
							} }
						>
							{ support_type === SUPPORT_TYPE_ADMIN_SECTION && (
								<Gridicon icon={ icon } size={ 18 } />
							) }
							<span>{ preventWidows( decodeEntities( title ) ) }</span>
						</a>
					</div>
				</li>
			</Fragment>
		);
	};

	const renderSearchResultsSection = ( id, title, results ) => {
		/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
		return (
			<Fragment key={ id }>
				{ title ? (
					<h3 id={ id } className="inline-help__results-title">
						{ title }
					</h3>
				) : null }
				<ul className="inline-help__results-list" aria-labelledby={ title ? id : undefined }>
					{ results.map( renderHelpLink ) }
				</ul>
			</Fragment>
		);
		/* eslint-enable jsx-a11y/no-noninteractive-element-to-interactive-role */
	};

	const renderSearchSections = ( results, query ) => {
		// Get the unique result types
		// TODO: Clean this up. There has to be a simpler way to find the unique search result types
		const searchResultTypes = results
			.map( ( searchResult ) => searchResult.support_type )
			.filter( ( type, index, arr ) => arr.indexOf( type ) === index );

		return searchResultTypes.map( ( resultType ) => {
			return renderSearchResultsSection(
				`inline-search--${ resultType }`,
				getTitleBySectionType( resultType, query ),
				results.filter( ( r ) => r.support_type === resultType )
			);
		} );
	};

	const resultsLabel = hasAPIResults
		? translate( 'Search Results' )
		: translate( 'Helpful resources for this section' );

	const renderSearchResults = () => {
		if ( isSearching && ! searchResults.length ) {
			// search, but no results so far
			return <PlaceholderLines lines={ placeholderLines } />;
		}

		return (
			<>
				{ ! isEmpty( searchQuery ) && ! hasAPIResults && (
					<p className="inline-help__empty-results">
						{ translate(
							'Sorry, there were no matches. Here are some of the most searched for help pages for this section:'
						) }
					</p>
				) }

				<div className="inline-help__results" aria-label={ resultsLabel }>
					{ renderSearchSections( searchResults, searchQuery ) }
				</div>
			</>
		);
	};

	return (
		<>
			<QueryInlineHelpSearch query={ searchQuery } />
			{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
			{ renderSearchResults() }
		</>
	);
}

HelpSearchResults.propTypes = {
	translate: PropTypes.func,
	searchQuery: PropTypes.string,
	onSelect: PropTypes.func.isRequired,
	onAdminSectionSelect: PropTypes.func,
	hasAPIResults: PropTypes.bool,
	searchResults: PropTypes.array,
	selectedResultIndex: PropTypes.number,
	isSearching: PropTypes.bool,
	selectedResult: PropTypes.object,
	track: PropTypes.func,
};

export default connect(
	( state, ownProps ) => ( {
		currentUserId: getCurrentUserId( state ),
		searchResults: getSearchResultsByQuery( state ),
		isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
		selectedResultIndex: getSelectedResultIndex( state ),
		hasAPIResults: hasInlineHelpAPIResults( state ),
		selectedResult: getInlineHelpCurrentlySelectedResult( state ),
		hasPurchases: hasCancelableUserPurchases( state, getCurrentUserId( state ) ),
		sectionName: getSectionName( state ),
	} ),
	{
		track: recordTracksEvent,
		selectSearchResult: selectResult,
	}
)( localize( HelpSearchResults ) );
