import type { VatDetails } from '@automattic/wpcom-checkout';

export function areVatDetailsSame( a: VatDetails, b: VatDetails ): boolean {
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
