/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useDispatch } from '@wordpress/data';
import { useState, useCallback, useEffect } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { useNavigate, useLocation } from 'react-router-dom';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { preventWidows } from 'calypso/lib/formatting';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { HELP_CENTER_STORE } from '../stores';
import { SearchResult } from '../types';
import { HelpCenterLaunchpad } from './help-center-launchpad';
import { HelpCenterMoreResources } from './help-center-more-resources';
import HelpCenterSearchResults from './help-center-search-results';
import { NewThirdPartyCookiesNotice } from './notices';
import './help-center-search.scss';
import './help-center-launchpad.scss';

type HelpCenterSearchProps = {
	onSearchChange?: ( query: string ) => void;
	currentRoute?: string;
};

export const HelpCenterSearch = ( { onSearchChange, currentRoute }: HelpCenterSearchProps ) => {
	const navigate = useNavigate();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const { sectionName, site, canConnectToZendesk } = useHelpCenterContext();
	const query = params.get( 'query' );
	const [ searchQuery, setSearchQuery ] = useState( query || '' );
	const { setSubject, setMessage } = useDispatch( HELP_CENTER_STORE );

	// when the user sets the search query, let's also populate the email subject and body
	// for later in case they subject the same query via email
	const setSearchQueryAndEmailSubject = useCallback(
		( query: string ) => {
			const subject =
				query.length > 100 ? query.replace( /\n/g, ' ' ).trim().slice( 0, 100 ) + '...' : query;
			setSearchQuery( query );
			setSubject( subject );
			setMessage( query );
			onSearchChange?.( query );
		},
		[ setSubject, setMessage, onSearchChange ]
	);

	const launchpadEnabled = site?.options?.launchpad_screen === 'full';

	// Search query can be a query param, if the user searches or clears the search field
	// we need to keep the query param up-to-date with that
	useEffect( () => {
		if ( query ) {
			navigate( '/?query=' + searchQuery );
		}
	}, [ searchQuery, query, navigate ] );

	const redirectToArticle = useCallback(
		( event: React.MouseEvent< HTMLAnchorElement, MouseEvent >, result: SearchResult ) => {
			event.preventDefault();

			// if result.post_id isn't set then open in a new window
			if ( ! result.post_id ) {
				const tracksData = {
					search_query: searchQuery,
					force_site_id: true,
					location: 'help-center',
					result_url: result.link,
					post_id: result.post_id,
					blog_id: result.blog_id,
				};
				recordTracksEvent( 'calypso_inlinehelp_article_no_postid_redirect', tracksData );
				window.open( result.link, '_blank' );
				return;
			}

			const params = new URLSearchParams( {
				link: result.link,
				postId: String( result.post_id ),
				query: searchQuery,
				title: preventWidows( decodeEntities( result.title ) ),
			} );

			if ( result.blog_id ) {
				params.set( 'blogId', String( result.blog_id ) );
			}

			navigate( `/post/?${ params }` );
		},
		[ navigate, searchQuery ]
	);

	return (
		<div className="inline-help__search">
			{ ! canConnectToZendesk && <NewThirdPartyCookiesNotice /> }
			{ launchpadEnabled && <HelpCenterLaunchpad /> }
			<InlineHelpSearchCard
				searchQuery={ searchQuery }
				onSearch={ setSearchQueryAndEmailSubject }
				location="help-center"
				isVisible
				placeholder={ __( 'Search for help', __i18n_text_domain__ ) }
				sectionName={ sectionName }
			/>
			<HelpCenterSearchResults
				onSelect={ redirectToArticle }
				searchQuery={ searchQuery || '' }
				openAdminInNewTab
				placeholderLines={ 4 }
				location="help-center"
				currentRoute={ currentRoute }
			/>
			{ ! searchQuery && <HelpCenterMoreResources /> }
		</div>
	);
};
