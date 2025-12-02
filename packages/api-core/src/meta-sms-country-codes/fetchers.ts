import { wpcom } from '../wpcom-fetcher';
import type { SMSCountryCode } from './types';

export async function fetchSMSCountryCodes(): Promise< SMSCountryCode[] > {
	return wpcom.req.get( {
		apiVersion: '1.1',
		path: '/meta/sms-country-codes/',
	} );
}
