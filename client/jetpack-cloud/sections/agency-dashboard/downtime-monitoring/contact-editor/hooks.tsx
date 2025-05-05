import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import { useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import type {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
} from '../../sites-overview/types';
import type { SmsCountry } from 'calypso/state/countries/types';

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

const EMPTY_ARRAY: SmsCountry[] = [];

export function useGetSupportedSMSCountries() {
	const countries = useSelector( ( state ) => getCountries( state, 'sms' ) );
	const countryCode = useGeoLocationQuery().data?.country_short;

	return useMemo( () => {
		if ( ! countries ) {
			return EMPTY_ARRAY;
		}

		if ( ! countryCode ) {
			return countries;
		}

		// Move the user's country to the top of the list
		const firstCountry = countries.find( ( country ) => country.code === countryCode );
		if ( ! firstCountry ) {
			return countries;
		}

		return [ firstCountry, ...countries.filter( ( country ) => country !== firstCountry ) ];
	}, [ countries, countryCode ] );
}
