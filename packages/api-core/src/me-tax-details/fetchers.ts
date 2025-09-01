import { wpcom } from '../wpcom-fetcher';
import type { UserTaxFormData } from '@automattic/api-core';

export async function fetchUserTaxDetails(): Promise< UserTaxFormData > {
	return await wpcom.req.get( '/me/vat-info' );
}
