import { wpcom } from '../wpcom-fetcher';
import type { UserTaxFormData } from './types';

export async function fetchUserTaxDetails(): Promise< UserTaxFormData > {
	return await wpcom.req.get( '/me/vat-info' );
}
