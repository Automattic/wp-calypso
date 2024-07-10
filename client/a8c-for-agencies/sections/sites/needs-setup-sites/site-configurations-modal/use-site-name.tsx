import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { freeSiteAddressType } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getRandomSiteBaseUrl } from './use-random-site-name';

import './style.scss';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;

const checkSiteAvailability = async ( agencyId: number, siteId: number, siteName: string ) => {
	const response = await wpcom.req.post(
		{
			path: `/agency/${ agencyId }/sites/${ siteId }/provision/validate`,
			apiNamespace: 'wpcom/v2',
		},
		{ site_name: siteName, domain: 'wordpress.com', type: freeSiteAddressType.BLOG }
	);

	if ( ! response.valid ) {
		const siteNameSuggestion = await getRandomSiteBaseUrl( siteName );
		return { siteNameSuggestion, valid: false };
	}

	return response;
};

const useCheckSiteAvailability = (
	siteId: number,
	siteName: string,
	skipAvailability: boolean
) => {
	const agencyId = useSelector( getActiveAgencyId );
	const siteNameRef = useRef( '' );
	const [ availabilityState, setAvilabilityState ] = useState( {
		isSiteNameAvailiable: true,
		isCheckingSiteAvailability: false,
		siteNameSuggestion: '',
	} );

	siteNameRef.current = siteName;

	useEffect( () => {
		if ( skipAvailability || availabilityState.siteNameSuggestion === siteName ) {
			setAvilabilityState( {
				isSiteNameAvailiable: true,
				isCheckingSiteAvailability: false,
				siteNameSuggestion: availabilityState.siteNameSuggestion,
			} );
			return;
		}
		if ( ! agencyId ) {
			return;
		}
		setAvilabilityState( {
			isSiteNameAvailiable: false,
			isCheckingSiteAvailability: true,
			siteNameSuggestion: '',
		} );

		checkSiteAvailability( agencyId, siteId, siteName ).then( ( result ) => {
			if ( siteName === siteNameRef.current ) {
				setAvilabilityState( {
					isSiteNameAvailiable: result.valid,
					isCheckingSiteAvailability: false,
					siteNameSuggestion: result.siteNameSuggestion,
				} );
			}
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ agencyId, siteId, siteName, skipAvailability ] );

	const revalidateCurrentSiteName = async () => {
		setAvilabilityState( {
			isSiteNameAvailiable: false,
			isCheckingSiteAvailability: false,
			siteNameSuggestion: await getRandomSiteBaseUrl( siteName ),
		} );
	};

	return { ...availabilityState, revalidateCurrentSiteName };
};

export const useSiteName = (
	randomSiteName: string,
	isRandomSiteNameLoading: boolean,
	siteId: number
) => {
	const translate = useTranslate();
	const [ siteName, setSiteName ] = useState( randomSiteName );
	const [ debouncedSiteName ] = useDebounce( siteName, 500 );
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
		setSiteName( randomSiteName );
	}, [ randomSiteName ] );

	let validationMessage: string | React.ReactNode;

	if ( siteName.match( /[^a-z0-9]/i ) ) {
		validationMessage = specialCharValidationErrorMessage;
	} else if (
		siteName.length < SUBDOMAIN_LENGTH_MINIMUM ||
		siteName.length > SUBDOMAIN_LENGTH_MAXIMUM
	) {
		validationMessage = lengthValidationErrorMessage;
	}

	const isDebouncingSiteName = siteName !== debouncedSiteName;
	const skipAvailability =
		validationMessage || isDebouncingSiteName || debouncedSiteName === randomSiteName;

	const {
		isCheckingSiteAvailability,
		isSiteNameAvailiable,
		siteNameSuggestion,
		revalidateCurrentSiteName,
	} = useCheckSiteAvailability( siteId, debouncedSiteName, !! skipAvailability );

	if ( ! isSiteNameAvailiable && ! isCheckingSiteAvailability && ! isDebouncingSiteName ) {
		if ( siteNameSuggestion ) {
			validationMessage = translate(
				'Sorry, that address is taken. How about{{nbsp /}}{{button}}%s{{/button}}?',
				{
					args: [ siteNameSuggestion ],
					components: {
						nbsp: <>&nbsp;</>,
						button: (
							<button
								onClick={ () => setSiteName( siteNameSuggestion ) }
								className="configure-your-site-modal-form__site-name-suggestion"
							/>
						),
					},
				}
			);
		} else {
			validationMessage = translate( 'Sorry, that address is taken.' );
		}
	}

	const showValidationMessage =
		!! validationMessage && ! isRandomSiteNameLoading && ! isCheckingSiteAvailability;

	const isSiteNameReadyForUse =
		isSiteNameAvailiable &&
		! showValidationMessage &&
		! isDebouncingSiteName &&
		! isCheckingSiteAvailability &&
		! isRandomSiteNameLoading;

	return {
		siteName,
		setSiteName,
		isSiteNameReadyForUse,
		validationMessage,
		showValidationMessage,
		isCheckingSiteAvailability,
		isDebouncingSiteName,
		revalidateCurrentSiteName,
	};
};
