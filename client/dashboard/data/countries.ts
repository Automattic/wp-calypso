import wpcom from 'calypso/lib/wp';
import type { CountryListItem } from './types';

export function fetchCountryList(): Promise< CountryListItem[] > {
	return wpcom.req.get( {
		path: '/me/transactions/supported-countries',
		apiVersion: '1.1',
	} );
}
