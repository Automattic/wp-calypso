import type { UserTaxDetails } from '../../data/types';

export function areUserTaxDetailsSame( a: UserTaxDetails, b: UserTaxDetails ): boolean {
	if ( a.id !== b.id ) {
		return false;
	}
	if ( a.country !== b.country ) {
		return false;
	}
	if ( a.name !== b.name ) {
		return false;
	}
	if ( a.address !== b.address ) {
		return false;
	}
	return true;
}
