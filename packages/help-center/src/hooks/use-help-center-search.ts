import { useDispatch } from '@wordpress/data';
import { useState, useCallback, useEffect } from '@wordpress/element';
import { useNavigate, useLocation } from 'react-router-dom';
import { HELP_CENTER_STORE } from '../stores';
import { useRedirectToArticle } from './use-redirect-to-article';

export const useHelpCenterSearch = ( onSearchChange?: ( query: string ) => void ) => {
	const navigate = useNavigate();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
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

	// Search query can be a query param, if the user searches or clears the search field
	// we need to keep the query param up-to-date with that
	useEffect( () => {
		if ( query !== null && searchQuery !== query ) {
			navigate( '/?query=' + searchQuery );
		}
	}, [ searchQuery, query, navigate ] );

	const redirectToArticle = useRedirectToArticle( { searchQuery } );

	return {
		searchQuery,
		setSearchQueryAndEmailSubject,
		redirectToArticle,
	};
};
