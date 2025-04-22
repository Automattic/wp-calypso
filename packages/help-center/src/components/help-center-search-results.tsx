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
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	page as pageIcon,
	arrowRight,
	chevronRight,
	external as externalIcon,
} from '@wordpress/icons';
import { useRtl } from 'i18n-calypso';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useAdminResults } from '../hooks/use-admin-results';
import { useContextBasedSearchMapping } from '../hooks/use-context-based-search-mapping';
import { useHelpSearchQuery } from '../hooks/use-help-search-query';
import HelpCenterRecentConversations from './help-center-recent-conversations';
import PlaceholderLines from './placeholder-lines';
import type { SearchResult } from '../types';

import './help-center-search-results.scss';

const MAX_VISIBLE_RESULTS = 5;

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

const HelpLink: React.FC< HelpLinkProps > = ( props ) => {
	const { result, type, index, onLinkClickHandler, externalLinks } = props;
	const { link, title, icon } = result;
	const { sectionName } = useHelpCenterContext();
	const isRtl = useRtl();

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

	const DeveloperResourceIndicator = () => {
		return (
			<div className="help-center-search-results-dev__resource">{ isRtl ? 'ved' : 'dev' }</div>
		);
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
						{ isResultFromDeveloperWordpress( result.link ) ? (
							<DeveloperResourceIndicator />
						) : (
							<LinkIcon />
						) }
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

const noop = () => {
	return;
};

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
	onAdminSectionSelect?: ( event: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) => void;
	searchQuery: string;
	placeholderLines: number;
	openAdminInNewTab: boolean;
	location: string;
	currentRoute?: string;
}

function HelpSearchResults( {
	externalLinks = false,
	onSelect,
	onAdminSectionSelect = noop,
	searchQuery = '',
	placeholderLines,
	openAdminInNewTab = false,
	location = 'inline-help-popover',
	currentRoute,
}: HelpSearchResultsProps ) {
	const { hasPurchases, sectionName, site } = useHelpCenterContext();

	const adminResults = useAdminResults( searchQuery );

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
		searchQuery || contextSearch, // If there's a query, we don't context search
		locale,
		currentRoute
	);

	const searchResults = searchData ?? [];
	const hasAPIResults = searchResults.length > 0;

	const [ visibleResults, setVisibleResults ] = useState( MAX_VISIBLE_RESULTS );

	const handleShowMore = () => {
		recordTracksEvent( 'calypso_help_center_search_results_show_more', {
			search_term: searchQuery,
			location,
			section: sectionName,
			visible_results: visibleResults,
		} );
		setVisibleResults( visibleResults + MAX_VISIBLE_RESULTS );
	};

	useEffect( () => {
		// Cancel all queued speak messages.
		loadingSpeak.cancel();
		resultsSpeak.cancel();
		errorSpeak.cancel();

		// If there's no query, then we don't need to announce anything.
		if ( ! searchQuery ) {
			setVisibleResults( MAX_VISIBLE_RESULTS );
			return;
		}

		if ( isSearching ) {
			loadingSpeak();
		} else if ( ! hasAPIResults ) {
			errorSpeak();
		} else if ( hasAPIResults ) {
			setVisibleResults( MAX_VISIBLE_RESULTS );
			resultsSpeak();
		}
	}, [ isSearching, hasAPIResults, searchQuery ] );

	const onLinkClickHandler = (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
		result: SearchResult,
		type: string
	) => {
		const { link, post_id, blog_id, source } = result;
		// check and catch admin section links.
		if ( type === SUPPORT_TYPE_ADMIN_SECTION && link ) {
			// record track-event.
			recordTracksEvent( 'calypso_inlinehelp_admin_section_visit', {
				link: link,
				search_term: searchQuery,
				location,
				section: sectionName,
			} );

			event.preventDefault();

			// push state only if it's internal link.
			if ( ! /^http/.test( link ) ) {
				openAdminInNewTab ? window.open( link, '_blank' ) : page( link );
			} else {
				openAdminInNewTab ? window.open( link, '_blank' ) : window.open( link, '_self' );
			}

			onAdminSectionSelect( event );
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

		recordTracksEvent( eventName, eventData );
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
					{ results.slice( 0, visibleResults ).map( ( result, index ) => (
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
				{ results.length > visibleResults && (
					<Button variant="secondary" onClick={ handleShowMore } className="show-more-button">
						{ __( 'Show more', __i18n_text_domain__ ) }
					</Button>
				) }
			</Fragment>
		) : null;
	};

	const sections = [
		{
			type: SUPPORT_TYPE_API_HELP,
			title: searchQuery
				? __( 'Search Results', __i18n_text_domain__ )
				: __( 'Recommended Resources', __i18n_text_domain__ ),
			results: searchResults,
			condition: ! isSearching && searchResults.length > 0,
		},
		{
			type: SUPPORT_TYPE_CONTEXTUAL_HELP,
			title: ! searchQuery.length ? __( 'Recommended Resources', __i18n_text_domain__ ) : '',
			results: contextualResults.slice( 0, 6 ),
			condition: ! isSearching && ! searchResults.length && contextualResults.length > 0,
		},
		{
			type: SUPPORT_TYPE_ADMIN_SECTION,
			title: __( 'Show me where to', __i18n_text_domain__ ),
			results: adminResults,
			condition: !! searchQuery && adminResults.length > 0,
		},
	].map( renderSearchResultsSection );

	const resultsLabel = hasAPIResults
		? __( 'Search Results', __i18n_text_domain__ )
		: __( 'Helpful resources for this section', __i18n_text_domain__ );

	return (
		<div className="help-center-search-results" aria-label={ resultsLabel }>
			{ ! searchQuery && <HelpCenterRecentConversations /> }
			{ isSearching && ! searchResults.length && <PlaceholderLines lines={ placeholderLines } /> }
			{ searchQuery && ! ( hasAPIResults || isSearching ) ? (
				<p className="help-center-search-results__empty-results">
					{ __(
						'Sorry, there were no matches. Here are some of the most searched for help pages for this section:',
						__i18n_text_domain__
					) }
				</p>
			) : null }
			{ sections }
		</div>
	);
}

HelpSearchResults.propTypes = {
	searchQuery: PropTypes.string,
	onSelect: PropTypes.func.isRequired,
	onAdminSectionSelect: PropTypes.func,
};

export default HelpSearchResults;
