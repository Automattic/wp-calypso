import { wpcom } from '../wpcom-fetcher';
import type { UserTaxFormData } from './types';

export async function updateUserTaxDetails(
	data: Partial< UserTaxFormData >
): Promise< Partial< UserTaxFormData > > {
	const { country, id, name, address } = data;
	return await wpcom.req.post( '/me/vat-info', { country, id, name, address } );
}
