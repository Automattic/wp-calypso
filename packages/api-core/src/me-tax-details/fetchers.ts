import { wpcom } from '../wpcom-fetcher';
import type { UserTaxFormData } from './types';

export function fetchUserTaxDetails(): Promise< UserTaxFormData > {
	return wpcom.req.get( '/me/vat-info' );
}
