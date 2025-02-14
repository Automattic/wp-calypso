import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';

export default function useWooPaymentsProduct() {
	const { wooExtensions } = useProductAndPlans( {
		productSearchQuery: '',
	} );

	return wooExtensions?.find( ( extension ) => extension.slug === 'woocommerce-woopayments' );
}
