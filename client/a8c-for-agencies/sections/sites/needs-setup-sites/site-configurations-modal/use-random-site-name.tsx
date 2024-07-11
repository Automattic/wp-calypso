import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';

export const getRandomSiteBaseUrl = async ( title: string ) => {
	const siteName = '';
	try {
		// const { body: urlSuggestions } = await wpcom.req.get( {
		const urlSuggestions = await wpcom.req.get( {
			apiNamespace: 'rest/v1.1',
			path: `/domains/suggestions?&query=${ title }&quantity=1&include_wordpressdotcom=true&include_dotblogsubdomain=false&vendor=dot`,
		} );
		// eslint-disable-next-line no-console
		console.log( 'debuglog urlSuggestions line 17', urlSuggestions );
		const validUrlWpComUrl = urlSuggestions.find( ( suggestion: { domain_name: string } ) =>
			suggestion.domain_name.includes( 'wordpress.com' )
		);
		// eslint-disable-next-line no-console
		console.log( 'debuglog validUrlWpComUrl line 22', validUrlWpComUrl );
		if ( validUrlWpComUrl ) {
			return validUrlWpComUrl.domain_name.split( '.' )[ 0 ];
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.log( 'debuglog error line 28', error );
	}
	// eslint-disable-next-line no-console
	console.log( 'debuglog siteName line 31', siteName );
	return siteName;
};

const getRandomSiteName = async () => {
	try {
		const { suggestions } = await wpcom.req.get( {
			apiNamespace: 'wpcom/v2',
			path: `/site-suggestions`,
		} );
		const { title } = suggestions[ 0 ];

		const siteName = await getRandomSiteBaseUrl( title );

		return siteName;
	} catch ( error ) {
		return '';
	}
};

export const useRandomSiteName = () => {
	const [ randomSiteName, setRandomSiteName ] = useState( '' );
	const [ isRandomSiteNameLoading, setIsRandomSiteNameLoading ] = useState( true );
	useEffect( () => {
		getRandomSiteName()
			.then( ( randomSiteName ) => {
				setRandomSiteName( randomSiteName );
				setIsRandomSiteNameLoading( false );
			} )
			.catch( () => {
				setRandomSiteName( '' );
				setIsRandomSiteNameLoading( false );
			} );
	}, [] );

	return { randomSiteName, isRandomSiteNameLoading };
};
