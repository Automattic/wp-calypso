import { speak } from '@wordpress/a11y';
import { useTranslate } from 'i18n-calypso';
import { debounce, isEmpty } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import Gridicon from 'calypso/components/gridicon';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getAdminHelpResults from 'calypso/state/inline-help/selectors/get-admin-help-results';
import getContextualHelpResults from 'calypso/state/inline-help/selectors/get-contextual-help-results';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { getSectionName } from 'calypso/state/ui/selectors';
import {
	SUPPORT_TYPE_ADMIN_SECTION,
	SUPPORT_TYPE_API_HELP,
	SUPPORT_TYPE_CONTEXTUAL_HELP,
} from './constants';
import { useInlineHelpSearchQuery } from './data/use-inline-help-search-query';
import PlaceholderLines from './placeholder-lines';

const noop = () => {};

function debounceSpeak( { message = '', priority = 'polite', timeout = 800 } ) {
	return debounce( () => {
		speak( message, priority );
	}, timeout );
}

const loadingSpeak = debounceSpeak( { message: 'Loading search results.', timeout: 1500 } );

const resultsSpeak = debounceSpeak( { message: 'Search results loaded.' } );

const errorSpeak = debounceSpeak( { message: 'No search results found.' } );

function HelpSearchResults( {
	externalLinks = false,
	onSelect,
	onAdminSectionSelect = noop,
	searchQuery = '',
	placeholderLines,
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const currentUserId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasPurchases = useSelector( ( state ) =>
		hasCancelableUserPurchases( state, getCurrentUserId( state ) )
	);
	const sectionName = useSelector( ( state ) => getSectionName( state ) );
	const contextualResults = useSelector( ( state ) => getContextualHelpResults( state ) );
	const adminResults = useSelector( ( state ) => getAdminHelpResults( state, searchQuery, 3 ) );

	const { data: searchResults = [], isLoading: isSearching = false } = useInlineHelpSearchQuery(
		searchQuery
	);
	const hasAPIResults = searchResults.length > 0;

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

	const onLinkClickHandler = ( event, result ) => {
		const { support_type: supportType, link } = result;
		// check and catch admin section links.
		if ( supportType === SUPPORT_TYPE_ADMIN_SECTION && link ) {
			// record track-event.
			dispatch(
				recordTracksEvent( 'calypso_inlinehelp_admin_section_visit', {
					link: link,
					search_term: searchQuery,
				} )
			);

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

		const external = externalLinks && support_type !== SUPPORT_TYPE_ADMIN_SECTION;

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
				<li className="inline-help__results-item">
					<div className="inline-help__results-cell">
						<a
							href={ localizeUrl( link ) }
							onClick={ ( event ) => {
								if ( ! external ) {
									event.preventDefault();
								}
								onLinkClickHandler( event, result );
							} }
							{ ...( external && {
								target: '_blank',
								rel: 'noreferrer',
							} ) }
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

	const renderSearchResultsSection = ( { id, title, results, condition } ) => {
		/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */

		return condition ? (
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
		) : null;
		/* eslint-enable jsx-a11y/no-noninteractive-element-to-interactive-role */
	};

	const renderSearchSections = () => {
		const sections = [
			{
				id: `inline-search--${ SUPPORT_TYPE_API_HELP }`,
				title: translate( 'Support articles' ),
				results: searchResults.slice( 0, 5 ),
				condition: ! isSearching && searchResults.length > 0,
			},
			{
				id: `inline-search--${ SUPPORT_TYPE_CONTEXTUAL_HELP }`,
				title: ! searchQuery.length ? translate( 'This might interest you' ) : '',
				results: contextualResults.slice( 0, 6 ),
				condition: ! isSearching && ! searchResults.length && contextualResults.length > 0,
			},
			{
				id: `inline-search--${ SUPPORT_TYPE_ADMIN_SECTION }`,
				title: translate( 'Show me where to' ),
				results: adminResults,
				condition: !! searchQuery && adminResults.length > 0,
			},
		];

		return sections.map( renderSearchResultsSection );
	};

	const resultsLabel = hasAPIResults
		? translate( 'Search Results' )
		: translate( 'Helpful resources for this section' );

	const renderSearchResults = () => {
		if ( isSearching && ! searchResults.length && ! adminResults.length ) {
			return <PlaceholderLines lines={ placeholderLines } />;
		}

		return (
			<>
				{ searchQuery && ! ( hasAPIResults || isSearching ) ? (
					<p className="inline-help__empty-results">
						{ translate(
							'Sorry, there were no matches. Here are some of the most searched for help pages for this section:'
						) }
					</p>
				) : null }

				<div className="inline-help__results" aria-label={ resultsLabel }>
					{ renderSearchSections() }
				</div>
			</>
		);
	};

	return (
		<>
			{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
			{ renderSearchResults() }
		</>
	);
}

HelpSearchResults.propTypes = {
	searchQuery: PropTypes.string,
	onSelect: PropTypes.func.isRequired,
	onAdminSectionSelect: PropTypes.func,
};

export default HelpSearchResults;
