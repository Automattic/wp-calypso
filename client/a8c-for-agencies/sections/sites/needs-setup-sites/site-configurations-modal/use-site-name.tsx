import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import wpcom from 'calypso/lib/wp';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;

const checkSiteAvailability = async ( siteName: string ) => {
	// To do: check site availability on the server
	if ( siteName ) {
		return true;
	}
};

const getRandomSiteName = async () => {
	const { suggestions } = await wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/site-suggestions`,
	} );
	const { title } = suggestions[ 0 ];

	const { body: urlSuggestions } = await wpcom.req.get( {
		apiNamespace: 'rest/v1.1',
		path: `/domains/suggestions?http_envelope=1&query=${ title }&quantity=10&include_wordpressdotcom=true&include_dotblogsubdomain=false&only_wordpressdotcom=true&vendor=dot&managed_subdomain_quantity=0`,
	} );

	for ( const { domain_name } of urlSuggestions ) {
		const siteName = domain_name.split( '.' )[ 0 ];
		const isAvailable = await checkSiteAvailability( siteName );
		if ( isAvailable ) {
			return siteName;
		}
	}

	// If all 10 urlSuggestions are taken (very unlikly) return empty '' name as falback
	return '';
};

export const useSiteName = () => {
	const translate = useTranslate();
	const [ siteName, setSiteName ] = useState( '' );
	const [ isRandomSiteLoading, setIsRandomSiteLoading ] = useState( true );
	const specialCharValidationErrorMessage = useMemo(
		() => translate( 'Your site address can only contain letters and numbers.' ),
		[ translate ]
	);
	const lengthValidationErrorMessage = useMemo(
		() =>
			translate(
				'Your site address should be between %(minimumLength)s and %(maximumLength)s characters in length.',
				{
					args: {
						minimumLength: SUBDOMAIN_LENGTH_MINIMUM,
						maximumLength: SUBDOMAIN_LENGTH_MAXIMUM,
					},
				}
			),
		[ translate ]
	);

	useEffect( () => {
		getRandomSiteName()
			.then( ( randomSiteName ) => {
				setSiteName( randomSiteName );
				setIsRandomSiteLoading( false );
			} )
			.catch( () => {
				setSiteName( '' );
				setIsRandomSiteLoading( false );
			} );
	}, [] );

	let validationMessage: string | React.ReactNode;

	if ( siteName.match( /[^a-z0-9]/i ) ) {
		validationMessage = specialCharValidationErrorMessage;
	} else if (
		siteName.length < SUBDOMAIN_LENGTH_MINIMUM ||
		siteName.length > SUBDOMAIN_LENGTH_MAXIMUM
	) {
		validationMessage = lengthValidationErrorMessage;
	}

	const showValidationMessage = !! validationMessage && ! isRandomSiteLoading;

	return { siteName, setSiteName, validationMessage, showValidationMessage, isRandomSiteLoading };
};
