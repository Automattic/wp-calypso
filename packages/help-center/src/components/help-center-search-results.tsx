/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import {
	getContextResults,
	LinksForSection,
	SUPPORT_TYPE_ADMIN_SECTION,
	SUPPORT_TYPE_API_HELP,
	SUPPORT_TYPE_CONTEXTUAL_HELP,
} from '@automattic/data-stores';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { speak } from '@wordpress/a11y';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import {
	arrowRight,
	chevronRight,
	code,
	external as externalIcon,
	Icon,
	details,
	page as pageIcon,
} from '@wordpress/icons';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useMemo } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useContextBasedSearchMapping } from '../hooks/use-context-based-search-mapping';
import { useHelpSearchQuery } from '../hooks/use-help-search-query';
import { HELP_CENTER_STORE } from '../stores';
import PlaceholderLines from './placeholder-lines';
import type { SearchResult } from '../types';
import type { HelpCenterSelect } from '@automattic/data-stores';
import './help-center-search-results.scss';

const MAX_VISIBLE_RESULTS = 8;

type HelpLinkProps = {
	result: SearchResult;
	type: string;
	index: number;
	onLinkClickHandler: (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
		result: SearchResult,
		type: string
	) => void;
	externalLinks?: boolean;
};

const isResultFromDeveloperWordpress = ( url: string ) => {
	const developerSiteRegex: RegExp = /developer\.wordpress\.com/;
	return developerSiteRegex.test( url );
};

const isResultFromCourses = ( url: string ) => {
	const coursesRegex: RegExp = /support\.wordpress\.com\/courses/;
	return coursesRegex.test( url );
};

const HelpLink: React.FC< HelpLinkProps > = ( props ) => {
	const { result, type, index, onLinkClickHandler, externalLinks } = props;
	const { link, title, icon } = result;
	const { sectionName } = useHelpCenterContext();

	const wpAdminSections = [ 'wp-admin', 'gutenberg-editor' ].includes( sectionName );
	const external = wpAdminSections || ( externalLinks && type !== SUPPORT_TYPE_ADMIN_SECTION );

	const LinkIcon = () => {
		if ( type === 'admin_section' ) {
			return <Icon icon={ arrowRight } />;
		}

		if ( icon ) {
			return <Gridicon icon={ icon } />;
		}

		return <Icon icon={ pageIcon } />;
	};

	const getResultIcon = () => {
		if ( isResultFromCourses( result.link ) ) {
			return <Icon icon={ details } />;
		}
		if ( isResultFromDeveloperWordpress( result.link ) ) {
			return <Icon icon={ code } />;
		}
		return <LinkIcon />;
	};

	return (
		<Fragment key={ `${ result.post_id ?? link ?? title }-${ index }` }>
			<li className="help-center-search-results__item help-center-link__item">
				<div className="help-center-search-results__cell help-center-link__cell">
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
						{ getResultIcon() }
						<span>{ preventWidows( decodeEntities( title ) ) }</span>
						<Icon
							width={ 20 }
							height={ 20 }
							icon={ result.post_id ? chevronRight : externalIcon }
						/>
					</a>
				</div>
			</li>
		</Fragment>
	);
};

interface SearchResultsSectionProps {
	type: string;
	title: string;
	results: SearchResult[];
	condition: boolean;
}

function debounceSpeak( {
	message = '',
	priority = 'polite' as 'polite' | 'assertive',
	timeout = 800,
} ) {
	return debounce( () => {
		speak( message, priority );
	}, timeout );
}

const loadingSpeak = debounceSpeak( {
	message: __( 'Loading search results.', __i18n_text_domain__ ),
	timeout: 1500,
} );

const resultsSpeak = debounceSpeak( {
	message: __( 'Search results loaded.', __i18n_text_domain__ ),
} );

const errorSpeak = debounceSpeak( {
	message: __( 'No search results found.', __i18n_text_domain__ ),
} );

const filterManagePurchaseLink = ( hasPurchases: boolean, isPurchasesSection: boolean ) => {
	if ( hasPurchases || isPurchasesSection ) {
		return () => true;
	}
	return (
		article:
			| LinksForSection
			| {
					readonly link: string;
					post_id: number;
					readonly title: string;
					readonly description: string;
			  }
			| {
					type: string;
					link: string;
					readonly title: string;
					readonly description: string;
					post_id?: number;
			  }
	) => article.post_id !== 111349;
};

interface HelpSearchResultsProps {
	externalLinks?: boolean;
	onSelect: (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
		result: SearchResult
	) => void;
	searchQuery: string;
	placeholderLines: number;
	openAdminInNewTab: boolean;
	location: string;
	currentRoute?: string;
}

function HelpSearchResults( {
	externalLinks = false,
	onSelect,
	searchQuery = '',
	placeholderLines,
	openAdminInNewTab = false,
	location = 'inline-help-popover',
	currentRoute,
}: HelpSearchResultsProps ) {
	const { hasPurchases, sectionName, site, source } = useHelpCenterContext();
	const { setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );
	const contextTerm = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getContextTerm(),
		[]
	);

	const isPurchasesSection = [ 'purchases', 'site-purchases' ].includes( sectionName );
	const siteIntent = site?.options.site_intent;
	const rawContextualResults = useMemo(
		() => getContextResults( sectionName || 'gutenberg-editor', siteIntent ?? 'build' ),
		[ sectionName, siteIntent ]
	);

	const locale = useLocale();
	const contextualResults = rawContextualResults.filter(
		// Unless searching with Inline Help or on the Purchases section, hide the
		// "Managing Purchases" documentation link for users who have not made a purchase.
		filterManagePurchaseLink( hasPurchases, isPurchasesSection )
	);

	const { contextSearch } = useContextBasedSearchMapping( currentRoute );

	const { data: searchData, isLoading: isSearching } = useHelpSearchQuery(
		searchQuery || contextTerm || contextSearch, // If there's a query, we don't context search
		locale,
		currentRoute,
		source
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

	const onLinkClickHandler = (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
		result: SearchResult,
		type: string
	) => {
		const { link, post_id, blog_id, source } = result;

		// Make the first recordTracksEvent call asynchronous
		queueMicrotask( () => {
			recordTracksEvent( 'calypso_help_center_search_traintracks_interact', {
				action: 'click',
				railcar: result.railcar.railcar,
				session_id: result.railcar.session_id,
				href: result.link,
				search_type: ! contextSearch && ! searchQuery ? 'tailored' : 'search',
				location,
				section: sectionName,
			} );
		} );

		// check and catch admin section links.
		if ( type === SUPPORT_TYPE_ADMIN_SECTION && link ) {
			// Make the admin section recordTracksEvent call asynchronous
			Promise.resolve().then( () => {
				recordTracksEvent( 'calypso_inlinehelp_admin_section_visit', {
					link: link,
					search_term: searchQuery,
					location,
					section: sectionName,
				} );
			} );

			event.preventDefault();

			// push state only if it's internal link.
			if ( ! /^http/.test( link ) ) {
				openAdminInNewTab ? window.open( link, '_blank' ) : page( link );
			} else {
				openAdminInNewTab ? window.open( link, '_blank' ) : window.open( link, '_self' );
			}
			return;
		}

		const eventData = {
			link,
			post_id,
			blog_id,
			source,
			search_term: searchQuery,
			location,
			section: sectionName,
		};

		const eventName =
			! contextSearch && ! searchQuery
				? 'calypso_inlinehelp_tailored_article_select'
				: 'calypso_inlinehelp_article_select';

		// Make the final recordTracksEvent call asynchronous
		Promise.resolve().then( () => {
			recordTracksEvent( eventName, eventData );
		} );
		onSelect( event, result );
	};

	const renderSearchResultsSection = ( {
		type,
		title,
		results,
		condition,
	}: SearchResultsSectionProps ) => {
		const id = `inline-search--${ type }`;

		return condition ? (
			<Fragment key={ id }>
				{ title ? (
					<h3 id={ id } className="help-center-search-results__title help-center__section-title">
						{ title }
					</h3>
				) : null }
				<ul
					className="help-center-search-results__list help-center-articles__list"
					aria-labelledby={ title ? id : undefined }
				>
					{ results.slice( 0, MAX_VISIBLE_RESULTS ).map( ( result, index ) => (
						<HelpLink
							key={ `${ id }-${ index }` }
							result={ result }
							type={ type }
							index={ index }
							onLinkClickHandler={ onLinkClickHandler }
							externalLinks={ externalLinks }
						/>
					) ) }
				</ul>
			</Fragment>
		) : null;
	};

	const sections = [
		{
			type: SUPPORT_TYPE_API_HELP,
			title: searchQuery
				? __( 'Search Results', __i18n_text_domain__ )
				: __( 'Recommended guides', __i18n_text_domain__ ),
			results: searchResults as unknown as SearchResult[],
			condition: ! isSearching && searchResults.length > 0,
		},
		{
			type: SUPPORT_TYPE_CONTEXTUAL_HELP,
			title: ! searchQuery.length ? __( 'Recommended guides', __i18n_text_domain__ ) : '',
			results: contextualResults.slice( 0, 6 ) as unknown as SearchResult[],
			condition: ! isSearching && ! searchResults.length && contextualResults.length > 0,
		},
	].map( renderSearchResultsSection );

	const resultsLabel = hasAPIResults
		? __( 'Search Results', __i18n_text_domain__ )
		: __( 'Helpful resources for this section', __i18n_text_domain__ );

	return (
		<div className="help-center-search-results" aria-label={ resultsLabel }>
			{ isSearching && ! searchResults.length && <PlaceholderLines lines={ placeholderLines } /> }
			{ searchQuery && ! ( hasAPIResults || isSearching ) ? (
				<div className="help-center-search-results__empty-results">
					<p>
						{ __(
							'Sorry, we couldn’t find any matches. Double-check your search or try asking your AI assistant about it.',
							__i18n_text_domain__
						) }
					</p>
					<Button
						variant="secondary"
						onClick={ () => setNavigateToRoute( '/odie' ) }
						className="show-more-button"
					>
						{ __( 'Ask AI assistant', __i18n_text_domain__ ) }
					</Button>
				</div>
			) : null }
			{ sections }
		</div>
	);
}

HelpSearchResults.propTypes = {
	searchQuery: PropTypes.string,
	onSelect: PropTypes.func.isRequired,
};

export default HelpSearchResults;
