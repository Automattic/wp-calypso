/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import debugFactory from 'debug';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import getCountries from 'state/selectors/get-countries';
import { fetchPaymentCountries } from 'state/countries/actions';

const debug = debugFactory( 'calypso:composite-checkout:use-country-list' );

export default function useCountryList( overrideCountryList ) {
	// Should we fetch the country list from global state?
	const shouldFetchList = overrideCountryList?.length <= 0;

	const [ countriesList, setCountriesList ] = useState( overrideCountryList );

	const reduxDispatch = useDispatch();
	const globalCountryList = useSelector( ( state ) => getCountries( state, 'payments' ) );

	// Has the global list been populated?
	const isListFetched = globalCountryList?.length > 0;

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
