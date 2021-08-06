import { useEffect, useState } from 'react';

const setTracksUser = ( client ) =>
	client
		.me()
		.get( { fields: 'ID,username' } )
		.then( ( { ID, username } ) => {
			window._tkq = window._tkq || [];
			window._tkq.push( [ 'identifyUser', ID, username ] );
		} )
		.catch( () => {} );

export const useClient = ( clientFactory ) => {
	const [ client, setClient ] = useState( null );

	useEffect( () => {
		clientFactory().then( ( newClient ) => {
			setClient( newClient );
		} );
	}, [ clientFactory, setClient ] );

	useEffect( () => {
		if ( ! client ) {
			return;
		}

		setTracksUser( client );
	}, [ client ] );

	return client;
};
