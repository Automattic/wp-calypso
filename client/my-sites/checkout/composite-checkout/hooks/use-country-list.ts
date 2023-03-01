import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPaymentCountries } from 'calypso/state/countries/actions';
import getCountries from 'calypso/state/selectors/get-countries';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { IAppState } from 'calypso/state/types';

const debug = debugFactory( 'calypso:composite-checkout:use-country-list' );

const emptyList: CountryListItem[] = [];

export default function useCountryList(
	overrideCountryList?: CountryListItem[]
): CountryListItem[] {
	const shouldFetch = ! overrideCountryList;
	const [ countriesList, setCountriesList ] = useState( overrideCountryList ?? [] );

	const reduxDispatch = useDispatch();
	const globalCountryList =
		useSelector( ( state: IAppState ) => getCountries( state, 'payments' ) ) || emptyList;

	// Has the global list been populated?
	const isListFetched = globalCountryList.length > 0;

	useEffect( () => {
		if ( shouldFetch ) {
			if ( isListFetched ) {
				debug( 'countries list is empty; filling with retrieved data' );
				setCountriesList( globalCountryList );
			} else {
				debug( 'countries list is empty; dispatching request for data' );
				reduxDispatch( fetchPaymentCountries() );
			}
			return;
		}

		debug( 'not fetching countries list because override is set' );
	}, [ isListFetched, globalCountryList, reduxDispatch, shouldFetch ] );

	return overrideCountryList ?? countriesList;
}
