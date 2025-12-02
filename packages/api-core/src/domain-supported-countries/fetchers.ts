import { wpcom } from '../wpcom-fetcher';
import type { CountryListItem, StatesListItem } from './types';

export async function fetchCountryList(): Promise< CountryListItem[] > {
	return await wpcom.req.get( {
		path: '/domains/supported-countries',
		apiVersion: '1.1',
	} );
}

export async function fetchStatesList( countryCode: string ): Promise< StatesListItem[] > {
	return await wpcom.req.get( {
		path: `/domains/supported-states/${ countryCode }`,
		apiVersion: '1.1',
	} );
}
