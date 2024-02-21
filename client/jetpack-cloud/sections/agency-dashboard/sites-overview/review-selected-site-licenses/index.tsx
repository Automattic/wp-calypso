import useProductAndPlans from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/licenses-form/hooks/use-product-and-plans';
import ReviewLicenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/review-licenses';
import { SelectedLicenseProp } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/types';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from '../lib/constants';
import type { Site } from '../types';

interface Props {
	onClose: () => void;
	selectedLicenses: Array< { siteId: number; products: Array< string > } >;
	sites: Site[];
}

export default function ReviewSelectedSiteLicenses( { onClose, selectedLicenses, sites }: Props ) {
	const { filteredProductsAndBundles } = useProductAndPlans( {} );

	const handleIssueLicense = () => {
		// TODO: implement issue license
	};

	const isLoading = false; // TODO: implement loading state

	const mappedSelectedLicenses = selectedLicenses.reduce(
		( acc: SelectedLicenseProp[], license ) => {
			license.products.forEach( ( product ) => {
				const productBundle = filteredProductsAndBundles.find(
					( productBundle ) => DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ product ] === productBundle.slug
				);

				if ( ! productBundle ) {
					return;
				}

				const siteUrl = sites.find( ( site ) => site.blog_id === license.siteId )?.url ?? '';

				const foundBundle = acc.find(
					( bundle ) => bundle.product_id === productBundle.product_id
				);

				if ( foundBundle ) {
					foundBundle.quantity++;
					foundBundle.siteUrls?.push( siteUrl );
				} else {
					acc.push( {
						...productBundle,
						quantity: 1,
						siteUrls: [ siteUrl ],
					} );
				}
			} );
			return acc;
		},
		[]
	);

	return (
		<ReviewLicenses
			isMultiSiteSelect
			onClose={ onClose }
			selectedLicenses={ mappedSelectedLicenses }
			handleIssueLicense={ handleIssueLicense }
			isLoading={ isLoading }
		/>
	);
}
