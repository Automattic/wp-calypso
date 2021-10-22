import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPaymentCountries } from 'calypso/state/countries/actions';
import getCountries from 'calypso/state/selectors/get-countries';
import type { CountryListItem } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-country-list' );

const emptyList: CountryListItem[] = [];

export default function useCountryList(
	overrideCountryList: CountryListItem[]
): CountryListItem[] {
	// Should we fetch the country list from global state?
	const shouldFetchList = overrideCountryList?.length <= 0;

	const [ countriesList, setCountriesList ] = useState( overrideCountryList );

	const reduxDispatch = useDispatch();
	const globalCountryList =
		useSelector( ( state ) => getCountries( state, 'payments' ) ) || emptyList;

	// Has the global list been populated?
	const isListFetched = globalCountryList.length > 0;

	useEffect( () => {
		if ( shouldFetchList ) {
			if ( isListFetched ) {
				setCountriesList( globalCountryList );
			} else {
				debug( 'countries list is empty; dispatching request for data' );
				reduxDispatch( fetchPaymentCountries() );
			}
		}
	}, [ shouldFetchList, isListFetched, globalCountryList, reduxDispatch ] );

	return countriesList;
}
