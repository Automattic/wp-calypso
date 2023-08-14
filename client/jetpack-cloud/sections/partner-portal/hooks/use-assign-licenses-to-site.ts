import { useCallback } from 'react';
import { getProductTitle } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import getProductSlugFromLicenseKey from '../lib/get-product-slug-from-license-key';
import type {
	ProductInfo,
	PurchasedProductsInfo,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

const NO_OP = () => {
	/* Do nothing */
};

type UseAssignLicensesToSiteOptions = {
	onError?: ( ( error: Error ) => void ) | ( () => void );
};
const useAssignLicensesToSite = (
	selectedSite?: { ID: number; domain: string } | null,
	options: UseAssignLicensesToSiteOptions = {}
): {
	assignLicensesToSite: ( licenseKeys: string[] ) => Promise< PurchasedProductsInfo >;
	isReady: boolean;
} => {
	const products = useProductsQuery();
	const assignLicense = useAssignLicenseMutation( {
		onError: options.onError ?? NO_OP,
	} );

	const isReady = assignLicense.isIdle;
	const assignLicensesToSite = useCallback(
		async ( licenseKeys: string[] ): Promise< PurchasedProductsInfo > => {
			// Only proceed if the mutation is in a fresh/ready state
			if ( ! assignLicense.isIdle ) {
				throw new Error( 'The mutation for assigning licenses is not ready' );
			}

			// We need a valid site ID in order to assign licenses to a site;
			// otherwise, we assign nothing
			const selectedSiteId = selectedSite?.ID;
			if ( ! selectedSiteId ) {
				throw new Error( 'A site ID is required for license assignment but was missing' );
			}

			const keysWithProductNames = licenseKeys
				.map( ( key ) => {
					const productSlug = getProductSlugFromLicenseKey( key );
					const selectedProduct = products?.data?.find?.(
						// Product slugs are limited to 38 characters in license keys.
						( p ) => p.slug.substring( 0, 38 ) === productSlug
					);

					return {
						key,
						product: selectedProduct,
					};
				} )
				// If we can't determine which product a license is meant for, filter it out
				.filter( ( { product } ) => Boolean( product ) )
				// We only need the product's title/display name
				.map( ( { key, product } ) => ( {
					key,
					name: getProductTitle( ( product as APIProductFamilyProduct ).name ),
				} ) );

			// Purposely catch any error responses and let them through,
			// so we can pass all their information along as ProductInfo objects
			// (not currently available via PromiseSettledResult<T>)
			const apiRequests = keysWithProductNames.map( ( { key, name } ) =>
				assignLicense
					.mutateAsync( { licenseKey: key, selectedSite: selectedSiteId } )
					.then( () => ( { key, name, status: 'fulfilled' } as ProductInfo ) )
					.catch( () => ( { key, name, status: 'rejected' } as ProductInfo ) )
			);

			return {
				selectedSite: selectedSite?.domain || '',
				selectedProducts: await Promise.all( apiRequests ),
			};
		},
		[ selectedSite, assignLicense, products ]
	);

	return { assignLicensesToSite, isReady };
};

export default useAssignLicensesToSite;
