import { isEnabled } from '@automattic/calypso-config';
import useAgencyProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import usePartnerPortalProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

export const getLicenseProductPrice = ( product: APIProductFamilyProduct ): number => {
	if ( isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' ) ) {
		if ( typeof product.monthly_price === 'number' ) {
			return product.monthly_price;
		}
		if ( typeof product.yearly_price === 'number' ) {
			return product.yearly_price / 12;
		}
	}

	return parseFloat( product.amount );
};

export default function useLicenseProduct( nonManageProductSlug: string ) {
	// The partner-portal query is gated on a legacy Jetpack Manage partner key, which agencies
	// migrated to Billing Dragon do not have. A4A reads the marketplace query instead, which is
	// keyed on the agency id and picks the Billing Dragon endpoint when the agency is on it.
	const agencyQuery = useAgencyProductsQuery();
	const partnerPortalQuery = usePartnerPortalProductsQuery();
	const { data, isFetched, isFetching } = isA8CForAgencies() ? agencyQuery : partnerPortalQuery;

	const productSlug = nonManageProductSlug.replace( '_yearly', '' ).replace( /_/g, '-' );
	const products: APIProductFamilyProduct[] | undefined = data;

	return {
		productSlug,
		product: products?.find( ( product ) => product.slug === productSlug ),
		isFetched,
		isFetching,
	};
}
