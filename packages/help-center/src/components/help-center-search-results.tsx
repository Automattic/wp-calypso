/* eslint-disable no-restricted-imports */
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
import { __ } from '@wordpress/i18n';
import {
	Icon,
	page as pageIcon,
	arrowRight,
	chevronRight,
	external as externalIcon,
} from '@wordpress/icons';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'use-debounce';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { useHelpSearchQuery } from 'calypso/data/help/use-help-search-query';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getAdminHelpResults from 'calypso/state/selectors/get-admin-help-results';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { useSiteOption } from 'calypso/state/sites/hooks';
import { getSectionName } from 'calypso/state/ui/selectors';
import PlaceholderLines from './placeholder-lines';
import type { SearchResult } from '../types';

interface SearchResultsSectionProps {
	type: string;
	title: string;
	results: SearchResult[];
	condition: boolean;
}

const noop = () => {
	return;
};

function debounceSpeak( { message = '', priority = 'polite', timeout = 800 } ) {
	return debounce( () => {
		speak( message, priority );
	}, timeout );
}

const loadingSpeak = debounceSpeak( { message: 'Loading search results.', timeout: 1500 } );

const resultsSpeak = debounceSpeak( { message: 'Search results loaded.' } );

const errorSpeak = debounceSpeak( { message: 'No search results found.' } );

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
}

function HelpSearchResults( {
	externalLinks = false,
	onSelect,
	onAdminSectionSelect = noop,
	searchQuery = '',
	placeholderLines,
	openAdminInNewTab = false,
	location = 'inline-help-popover',
}: HelpSearchResultsProps ) {
	const dispatch = useDispatch();
	const hasPurchases = useSelector( hasCancelableUserPurchases );
	const sectionName = useSelector( getSectionName );
	const adminResults = useSelector( ( state ) => getAdminHelpResults( state, searchQuery, 3 ) );

	const isPurchasesSection = [ 'purchases', 'site-purchases' ].includes( sectionName );
	const siteIntent = useSiteOption( 'site_intent' );
	const rawContextualResults = useMemo(
		() => getContextResults( sectionName, siteIntent ),
		[ sectionName, siteIntent ]
	);
	const locale = useLocale();
	const contextualResults = rawContextualResults.filter(
		// Unless searching with Inline Help or on the Purchases section, hide the
		// "Managing Purchases" documentation link for users who have not made a purchase.
		filterManagePurchaseLink( hasPurchases, isPurchasesSection )
	);

	const [ debouncedQuery ] = useDebounce( searchQuery || '', 500 );

	const { data: searchData, isLoading: isSearching } = useHelpSearchQuery(
		debouncedQuery,
		locale,
		{},
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

	const onLinkClickHandler = (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
		result: SearchResult,
		type: string
	) => {
		const { link, post_id, blog_id, source } = result;
		// check and catch admin section links.
		if ( type === SUPPORT_TYPE_ADMIN_SECTION && link ) {
			// record track-event.
			dispatch(
				recordTracksEvent( 'calypso_inlinehelp_admin_section_visit', {
					link: link,
					search_term: searchQuery,
					location,
					section: sectionName,
				} )
			);

			// push state only if it's internal link.
			if ( ! /^http/.test( link ) ) {
				event.preventDefault();
				openAdminInNewTab ? window.open( 'https://wordpress.com' + link, '_blank' ) : page( link );
				onAdminSectionSelect( event );
			}

			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_inlinehelp_article_select', {
				link,
				post_id,
				blog_id,
				source,
				search_term: searchQuery,
				location,
				section: sectionName,
			} )
		);

		onSelect( event, result );
	};

	type HelpLinkProps = {
		result: SearchResult;
		type: string;
		index: number;
	};

	const HelpLink: React.FC< HelpLinkProps > = ( props ) => {
		const { result, type, index } = props;
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
			<Fragment key={ `${ result.post_id ?? link ?? title }-${ index }` }>
				<li className="help-center-search-results__item">
					<div className="help-center-search-results__cell">
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
							<LinkIcon />
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
					<h3 id={ id } className="help-center-search-results__title">
						{ title }
					</h3>
				) : null }
				<ul
					className="help-center-search-results__list help-center-articles__list"
					aria-labelledby={ title ? id : undefined }
				>
					{ results.map( ( result, index ) => (
						<HelpLink
							key={ `${ id }-${ index }` }
							result={ result }
							type={ type }
							index={ index }
						/>
					) ) }
				</ul>
			</Fragment>
		) : null;
	};

	const renderSearchSections = () => {
		const sections = [
			{
				type: SUPPORT_TYPE_API_HELP,
				title: __( 'Recommended resources', __i18n_text_domain__ ),
				results: searchResults.slice( 0, 5 ),
				condition: ! isSearching && searchResults.length > 0,
			},
			{
				type: SUPPORT_TYPE_CONTEXTUAL_HELP,
				title: ! searchQuery.length ? __( 'Recommended resources', __i18n_text_domain__ ) : '',
				results: contextualResults.slice( 0, 6 ),
				condition: ! isSearching && ! searchResults.length && contextualResults.length > 0,
			},
			{
				type: SUPPORT_TYPE_ADMIN_SECTION,
				title: __( 'Show me where to', __i18n_text_domain__ ),
				results: adminResults,
				condition: !! searchQuery && adminResults.length > 0,
			},
		];

		return sections.map( renderSearchResultsSection );
	};

	const resultsLabel = hasAPIResults
		? __( 'Search Results', __i18n_text_domain__ )
		: __( 'Helpful resources for this section', __i18n_text_domain__ );

	const renderSearchResults = () => {
		return (
			<>
				{ isSearching && ! searchResults.length && <PlaceholderLines lines={ placeholderLines } /> }
				{ searchQuery && ! ( hasAPIResults || isSearching ) ? (
					<p className="help-center-search-results__empty-results">
						{ __(
							'Sorry, there were no matches. Here are some of the most searched for help pages for this section:',
							__i18n_text_domain__
						) }
					</p>
				) : null }

				<div className="help-center-search-results__results" aria-label={ resultsLabel }>
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
