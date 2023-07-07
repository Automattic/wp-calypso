import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
} from '../../sites-overview/types';
import type { AppState } from 'calypso/types';

export function useContactModalTitleAndSubtitle(
	type: AllowedMonitorContactTypes,
	action: AllowedMonitorContactActions
): {
	title: string;
	subtitle: string;
} {
	const translate = useTranslate();

	const getContactModalTitleAndSubTitle = useMemo(
		() => ( {
			email: {
				add: {
					title: translate( 'Add new email address' ),
					subtitle: translate(
						'Please use an email address that is accessible. Only alerts will be sent.'
					),
				},
				edit: {
					title: translate( 'Edit your email address' ),
					subtitle: translate( 'If you update your email address, you’ll need to verify it.' ),
				},
				remove: {
					title: translate( 'Remove Email' ),
					subtitle: translate( 'Are you sure you want to remove this email address?' ),
				},
				verify: {
					title: translate( 'Verify your email address' ),
					subtitle: translate( 'We’ll send a code to verify your email address.' ),
				},
			},
			sms: {
				add: {
					title: translate( 'Add your phone number' ),
					subtitle: translate(
						'Please use phone number that is accessible. Only alerts will be sent.'
					),
				},
				edit: {
					title: translate( 'Edit your phone number' ),
					subtitle: translate( 'If you update your number, you’ll need to verify it.' ),
				},
				remove: {
					title: translate( 'Remove Phone Number' ),
					subtitle: translate( 'Are you sure you want to remove this phone number?' ),
				},
				verify: {
					title: translate( 'Verify your phone number' ),
					subtitle: translate( 'We’ll send a code to verify your phone number.' ),
				},
			},
		} ),
		[ translate ]
	);

	return getContactModalTitleAndSubTitle[ type ][ action ];
}

export function useContactFormInputHelpText( type: AllowedMonitorContactTypes ) {
	const translate = useTranslate();

	return useMemo( () => {
		return {
			email: {
				name: translate( 'Give this email a nickname for your personal reference.' ),
				email: translate( 'We’ll send a code to verify your email address.' ),
				verificationCode: translate( 'Please enter the code you received via email' ),
			},
			sms: {
				name: translate( 'Give this number a nickname for your personal reference.' ),
				phoneNumber: translate( 'We’ll send a code to verify your phone number.' ),
				verificationCode: translate( 'Please enter the code you received via SMS' ),
			},
		}[ type ];
	}, [ translate, type ] );
}

export function useGetSupportedSMSCountries() {
	// Fetch only once
	const { data: geoData } = useGeoLocationQuery( {
		refetchOnWindowFocus: false,
		staleTime: Infinity,
	} );

	return useSelector( ( state: AppState ) => {
		const countries = getCountries( state, 'sms' ) ?? [];
		// Move the user's country to the top of the list
		const index = countries.findIndex( ( country ) => country.code === geoData?.country_short );
		if ( index > 0 ) {
			const country = countries.splice( index, 1 );
			countries.unshift( country[ 0 ] );
		}
		return countries;
	} );
}
