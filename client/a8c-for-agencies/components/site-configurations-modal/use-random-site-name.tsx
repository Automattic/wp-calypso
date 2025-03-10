import { useCallback, useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';

export const getRandomSiteBaseUrl = async ( title: string ) => {
	const siteName = '';
	try {
		const urlSuggestions = await wpcom.req.get( '/domains/suggestions', {
			query: title,
			quantity: 1,
			include_wordpressdotcom: true,
			include_dotblogsubdomain: false,
			vendor: 'dot',
		} );
		const validUrlWpComUrl = urlSuggestions.find( ( suggestion: { domain_name: string } ) =>
			suggestion.domain_name.includes( 'wordpress.com' )
		);
		if ( validUrlWpComUrl ) {
			return validUrlWpComUrl.domain_name.split( '.' )[ 0 ];
		}
	} catch ( error ) {}
	return siteName;
};

const getRandomSiteName = async () => {
	try {
		const { suggestions } = await wpcom.req.get( {
			path: '/site-suggestions',
			apiNamespace: 'wpcom/v2',
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

	const fetchRandomSiteName = useCallback( async () => {
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

	useEffect( () => {
		fetchRandomSiteName();
	}, [ fetchRandomSiteName ] );

	return { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName: fetchRandomSiteName };
};
