import {
	JetpackLicenseFilter,
	JetpackLicenseSortDirection,
	JetpackLicenseSortField,
} from '@automattic/api-core';
import { jetpackAgencyLicensesQuery } from '@automattic/api-queries';
import { isPressableAddonProduct, isPressableHostingProduct } from './pressable-plans';
import type { Agency, AgencyProduct, JetpackLicense } from '@automattic/api-core';

const LICENSES_STALE_TIME = 5 * 60 * 1000;

/** The agency's live Pressable licenses, newest first. Shared with the Products page. */
export const pressableLicensesQuery = ( agencyId: number ) => ( {
	...jetpackAgencyLicensesQuery( agencyId, {
		filter: JetpackLicenseFilter.NotRevoked,
		search: 'pressable',
		sortField: JetpackLicenseSortField.IssuedAt,
		sortDirection: JetpackLicenseSortDirection.Descending,
	} ),
	staleTime: LICENSES_STALE_TIME,
} );

export const getPressableProducts = ( products: AgencyProduct[] ) =>
	products.filter( ( product ) => isPressableHostingProduct( product.family_slug ) );

export type PressableOwnershipType = 'none' | 'regular' | 'agency';

// A Pressable account bought outside the A4A marketplace has no A4A id.
export function getPressableOwnershipType(
	agency: Agency | null | undefined
): PressableOwnershipType {
	const pressable = agency?.third_party?.pressable;
	if ( ! pressable?.pressable_id ) {
		return 'none';
	}
	return pressable.a4a_id === null ? 'regular' : 'agency';
}

/**
 * What the page sells depends on this: a referral or an A4A plan counts as
 * owning one, while a Pressable account from outside A4A counts as none.
 */
export function getEffectivePressableOwnership(
	ownership: PressableOwnershipType,
	plan: AgencyProduct | undefined,
	isReferralMode: boolean
): PressableOwnershipType {
	if ( isReferralMode || plan ) {
		return 'agency';
	}
	return ownership === 'regular' ? 'none' : ownership;
}

const matchesProduct = ( license: JetpackLicense, product: AgencyProduct | undefined ) =>
	!! product &&
	( license.product_id === product.product_id ||
		license.product_id === product.monthly_product_id ||
		license.product_id === product.yearly_product_id );

export const isPressablePlanLicense = ( license: JetpackLicense ) =>
	license.license_key.startsWith( 'pressable' ) &&
	! isPressableAddonProduct( license.license_key ) &&
	! license.referral;

export const getPressableLicenses = ( licenses: JetpackLicense[] ) =>
	licenses.filter( ( license ) => isPressableHostingProduct( license.license_key ) );

/** The Pressable plan the agency bought for itself, if any. */
export function findAgencyPressablePlan(
	licenses: JetpackLicense[],
	pressableProducts: AgencyProduct[]
): AgencyProduct | undefined {
	const license = licenses.find( isPressablePlanLicense );
	if ( ! license ) {
		return undefined;
	}
	return pressableProducts.find( ( product ) => matchesProduct( license, product ) );
}
