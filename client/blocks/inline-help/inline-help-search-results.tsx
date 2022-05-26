import { Gridicon } from '@automattic/components';
import { getContextResults, LinksForSection } from '@automattic/help-center';
import { localizeUrl } from '@automattic/i18n-utils';
import { speak } from '@wordpress/a11y';
import { Icon, page as pageIcon, arrowRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { debounce, noop } from 'lodash';
import page from 'page';
import React, { Fragment, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { useHelpSearchQuery } from 'calypso/data/help/use-help-search-query';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getAdminHelpResults from 'calypso/state/inline-help/selectors/get-admin-help-results';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import { useSiteOption } from 'calypso/state/sites/hooks';
import { getSectionName } from 'calypso/state/ui/selectors';
import {
	SUPPORT_TYPE_ADMIN_SECTION,
	SUPPORT_TYPE_API_HELP,
	SUPPORT_TYPE_CONTEXTUAL_HELP,
} from './constants';
import PlaceholderLines from './placeholder-lines';

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
	return ( { post_id }: LinksForSection ) => post_id !== 111349;
};
type Props = {
	searchQuery?: string;
	onSelect: ( event: React.MouseEvent< HTMLAnchorElement >, link: LinksForSection ) => void;
	onAdminSectionSelect?: ( event: React.MouseEvent< HTMLAnchorElement > ) => void;
	placeholderLines?: number;
	openAdminInNewTab?: boolean;
	externalLinks?: boolean;
};

function HelpSearchResults( {
	externalLinks = false,
	onSelect,
	onAdminSectionSelect = noop,
	searchQuery = '',
	placeholderLines,
	openAdminInNewTab = false,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasPurchases = useSelector( hasCancelableUserPurchases ) as boolean;
	const sectionName = useSelector( getSectionName ) as string;
	const isPurchasesSection = [ 'purchases', 'site-purchases' ].includes( sectionName );
	const siteIntent = useSiteOption( 'site_intent' ) as string;
	const rawContextualResults = useMemo(
		() => getContextResults( sectionName, siteIntent ),
		[ sectionName, siteIntent ]
	);
	const adminResults: LinksForSection[] = useSelector( ( state ) =>
		getAdminHelpResults( state, searchQuery, 3 )
	);

	const contextualResults: LinksForSection[] = rawContextualResults.filter(
		// Unless searching with Inline Help or on the Purchases section, hide the
		// "Managing Purchases" documentation link for users who have not made a purchase.
		filterManagePurchaseLink( hasPurchases, isPurchasesSection )
	);
	const { data: searchData, isLoading: isSearching } = useHelpSearchQuery( searchQuery );

	const searchResults: LinksForSection[] = searchData?.wordpress_support_links ?? [];
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
		event: React.MouseEvent< HTMLAnchorElement >,
		result: LinksForSection,
		type: string
	) => {
		const { link } = result;
		// check and catch admin section links.
		if ( type === SUPPORT_TYPE_ADMIN_SECTION && link ) {
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
				openAdminInNewTab ? window.open( 'https://wordpress.com' + link, '_blank' ) : page( link );
				onAdminSectionSelect( event );
			}

			return;
		}
		onSelect( event, result );
	};

	const renderHelpLink = ( result: LinksForSection, type: string ) => {
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
			<Fragment key={ link ?? title }>
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
							<span>{ preventWidows( decodeEntities( title ) ) }</span>
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
	}: {
		type: string;
		title: string;
		results: LinksForSection[];
		condition: boolean;
	} ) => {
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
				title: translate( 'Recommended resources' ) as string,
				results: searchResults.slice( 0, 5 ),
				condition: ! isSearching && searchResults.length > 0,
			},
			{
				type: SUPPORT_TYPE_CONTEXTUAL_HELP,
				title: ( ! searchQuery.length ? translate( 'Recommended resources' ) : '' ) as string,
				results: contextualResults.slice( 0, 6 ),
				condition: ! isSearching && ! searchResults.length && contextualResults.length > 0,
			},
			{
				type: SUPPORT_TYPE_ADMIN_SECTION,
				title: translate( 'Show me where to' ) as string,
				results: adminResults,
				condition: !! searchQuery && adminResults.length > 0,
			},
		];

		return sections.map( renderSearchResultsSection );
	};

	const resultsLabel = hasAPIResults
		? ( translate( 'Search Results' ) as string )
		: ( translate( 'Helpful resources for this section' ) as string );

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
export default HelpSearchResults;
