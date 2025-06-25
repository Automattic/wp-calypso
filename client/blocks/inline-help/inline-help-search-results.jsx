import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { getContextResults } from '@automattic/data-stores';
import { useHelpSearchQuery } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { speak } from '@wordpress/a11y';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { Icon, page as pageIcon, arrowRight } from '@wordpress/icons';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getAdminHelpResults from 'calypso/state/selectors/get-admin-help-results';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { useSiteOption } from 'calypso/state/sites/hooks';
import { getSectionName } from 'calypso/state/ui/selectors';
import {
	SUPPORT_TYPE_ADMIN_SECTION,
	SUPPORT_TYPE_API_HELP,
	SUPPORT_TYPE_CONTEXTUAL_HELP,
} from './constants';
import PlaceholderLines from './placeholder-lines';

import './style.scss';

const noop = () => {};

function debounceSpeak( { message = '', priority = 'polite', timeout = 800 } ) {
	return debounce( () => {
		speak( message, priority );
	}, timeout );
}

const loadingSpeak = debounceSpeak( { message: 'Loading search results.', timeout: 1500 } );

const resultsSpeak = debounceSpeak( { message: 'Search results loaded.' } );

const errorSpeak = debounceSpeak( { message: 'No search results found.' } );

const filterManagePurchaseLink = ( hasPurchases, isPurchasesSection ) => {
	if ( hasPurchases || isPurchasesSection ) {
		return () => true;
	}
	return ( { post_id } ) => post_id !== 111349;
};

function HelpSearchResults( {
	externalLinks = false,
	onSelect,
	onAdminSectionSelect = noop,
	searchQuery = '',
	placeholderLines,
	openAdminInNewTab = false,
	location = 'inline-help-popover',
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasPurchases = useSelector( hasCancelableUserPurchases );
	const sectionName = useSelector( getSectionName );
	const isPurchasesSection = [ 'purchases', 'site-purchases' ].includes( sectionName );
	const siteIntent = useSiteOption( 'site_intent' );
	const rawContextualResults = useMemo(
		() => getContextResults( sectionName, siteIntent ),
		[ sectionName, siteIntent ]
	);

	const adminResults = useSelector( ( state ) => getAdminHelpResults( state, searchQuery, 3 ) );

	const contextualResults = rawContextualResults.filter(
		// Unless searching with Inline Help or on the Purchases section, hide the
		// "Managing Purchases" documentation link for users who have not made a purchase.
		filterManagePurchaseLink( hasPurchases, isPurchasesSection )
	);

	const { data: searchData, isInitialLoading: isSearching } = useHelpSearchQuery(
		searchQuery,
		getLocaleSlug(),
		sectionName
	);

	const searchResults = searchData ?? [];
	const hasAPIResults = searchResults.length > 0;

	useEffect( () => {
		// Cancel all queued speak messages.
		loadingSpeak.cancel();
		resultsSpeak.cancel();
		errorSpeak.cancel();

		// If there's no query, then we don't need to announce anything.
		if ( ! searchQuery ) {
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

	const { setShowSupportDoc } = useDataStoreDispatch( 'automattic/help-center' );

	const onLinkClickHandler = ( event, result, type ) => {
		const { link, post_id: postId, blog_id: blogId } = result;
		if ( ! link ) {
			onSelect( event, result );
			return;
		}

		if ( type !== SUPPORT_TYPE_ADMIN_SECTION ) {
			if ( type === SUPPORT_TYPE_API_HELP ) {
				event.preventDefault();

				setShowSupportDoc( link, postId, blogId );
			}
			onSelect( event, result );
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_inlinehelp_admin_section_visit', {
				link: link,
				search_term: searchQuery,
				location,
				section: sectionName,
			} )
		);

		if ( ! /^http/.test( link ) ) {
			event.preventDefault();
			openAdminInNewTab ? window.open( 'https://wordpress.com' + link, '_blank' ) : page( link );
			onAdminSectionSelect( event );
		}
	};

	const renderHelpLink = ( result, type ) => {
		const { link, title, icon } = result;

		const external = externalLinks && type !== SUPPORT_TYPE_ADMIN_SECTION;

		const LinkIcon = () => {
			if ( type === 'admin_section' ) {
				return <Icon icon={ arrowRight } />;
			}

			if ( icon ) {
				return <Gridicon icon={ icon } />;
			}

			return <Icon icon={ pageIcon } />;
		};

		return (
			<Fragment key={ title ?? link }>
				<li className="inline-help__results-item">
					<div className="inline-help__results-cell">
						<a
							href={ localizeUrl( link ) }
							onClick={ ( event ) => {
								if ( ! external ) {
									event.preventDefault();
								}
								onLinkClickHandler( event, result, type );
							} }
							{ ...( external && {
								target: '_blank',
								rel: 'noreferrer',
							} ) }
						>
							{ /* Old stuff - leaving this incase we need to quick revert
							{ icon && <Gridicon icon={ icon } size={ 18 } /> } */ }
							<LinkIcon />
							<span>{ decodeEntities( title ) }</span>
						</a>
					</div>
				</li>
			</Fragment>
		);
	};

	const renderSearchResultsSection = ( { type, title, results, condition } ) => {
		const id = `inline-search--${ type }`;

		return condition ? (
			<Fragment key={ id }>
				{ title ? (
					<h3 id={ id } className="inline-help__results-title">
						{ title }
					</h3>
				) : null }
				<ul className="inline-help__results-list" aria-labelledby={ title ? id : undefined }>
					{ results.map( ( result ) => renderHelpLink( result, type ) ) }
				</ul>
			</Fragment>
		) : null;
	};

	const renderSearchSections = () => {
		const sections = [
			{
				type: SUPPORT_TYPE_API_HELP,
				title: translate( 'Recommended Resources' ),
				results: searchResults.slice( 0, 5 ),
				condition: ! isSearching && searchResults.length > 0,
			},
			{
				type: SUPPORT_TYPE_CONTEXTUAL_HELP,
				title: ! searchQuery.length ? translate( 'Recommended Resources' ) : '',
				results: contextualResults.slice( 0, 6 ),
				condition: ! isSearching && ! searchResults.length && contextualResults.length > 0,
			},
			{
				type: SUPPORT_TYPE_ADMIN_SECTION,
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
			<QueryUserPurchases />
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
