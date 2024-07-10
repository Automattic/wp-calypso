import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';

export const getRandomSiteBaseUrl = async ( title: string ) => {
	let siteName: string;
	try {
		const { body: urlSuggestions } = await wpcom.req.get( {
			apiNamespace: 'rest/v1.1',
			path: `/domains/suggestions?http_envelope=1&query=${ title }&quantity=10&include_wordpressdotcom=true&include_dotblogsubdomain=false&only_wordpressdotcom=true&vendor=dot&managed_subdomain_quantity=0`,
		} );
		const firstUrl = urlSuggestions[ 0 ].domain_name.split( '.' )[ 0 ];
		siteName = firstUrl.split( '.' )[ 0 ];
	} catch ( error ) {
		return '';
	}
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
