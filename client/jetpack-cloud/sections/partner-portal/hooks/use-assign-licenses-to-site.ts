import { useCallback } from 'react';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getProductSlugFromLicenseKey, getProductTitle } from '../lib';
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

					if ( ! selectedProduct ) {
						return null;
					}

					return {
						key,
						product: selectedProduct,
					};
				} )
				// If we can't determine which product a license is meant for, filter it out.
				// The Exclude<> usage here is to let Typescript know that the null case has been eliminated.
				.filter( ( item ): item is Exclude< typeof item, null > => item !== null )
				// Sort ascending by product id as a quick and dirty way to avoid race conditions between add-on
				// products and their dependencies. For example, Jetpack Backup Add-on Storage requires that Jetpack
				// Backup is present on the site, so we need to assign the Jetpack Backup license first.
				// We rely on the product id because add-ons should practically always have a higher product id
				// than the product they are an add-on for.
				.sort( ( a, b ) => b.product.product_id - a.product.product_id )
				// We only need the product's title/display name
				.map( ( { key, product } ) => ( {
					key,
					name: getProductTitle( ( product as APIProductFamilyProduct ).name ),
				} ) );

			const apiRequests = [];

			// Purposely catch any error responses and let them through,
			// so we can pass all their information along as ProductInfo objects
			// (not currently available via PromiseSettledResult<T>)
			for ( let i = 0; i < keysWithProductNames.length; i++ ) {
				const { key, name } = keysWithProductNames[ i ];
				apiRequests.push(
					// Assign the products sequentially to guarantee products that depend on other products have their
					// dependencies assigned first.
					await assignLicense
						.mutateAsync( { licenseKey: key, selectedSite: selectedSiteId } )
						.then(
							() =>
								( {
									key,
									name,
									status: 'fulfilled',
								} ) as ProductInfo
						)
						.catch(
							() =>
								( {
									key,
									name,
									status: 'rejected',
								} ) as ProductInfo
						)
				);
			}

			return {
				selectedSite: selectedSite?.domain || '',
				selectedProducts: apiRequests,
			};
		},
		[ selectedSite, assignLicense, products ]
	);

	return { assignLicensesToSite, isReady };
};

export default useAssignLicensesToSite;
