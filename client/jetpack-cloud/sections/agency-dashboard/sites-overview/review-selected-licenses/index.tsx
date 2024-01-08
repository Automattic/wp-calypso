import { useCallback, useEffect, useState } from 'react';
import useProductAndPlans from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-v2/licenses-form/hooks/use-product-and-plans';
import ReviewLicenses from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-v2/review-licenses';
import { useSelector } from 'calypso/state';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from '../lib/constants';
import type { Site } from '../types';
import type { SelectedLicenseProp } from 'calypso/jetpack-cloud/sections/partner-portal/issue-license-v2/types';

import './style.scss';

interface Props {
	onClose: () => void;
	selectedLicenses: Array< { siteId: number; products: Array< string > } >;
	sites: Site[];
}

export default function ReviewSelectedLicenses( { onClose, selectedLicenses, sites }: Props ) {
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const { filteredProductsAndBundles } = useProductAndPlans( {} );

	const [ showAddCard, setShowAddCard ] = useState( false );
	const [ paymentMethodAdded, setPaymentMethodAdded ] = useState( false );

	const issueAndAssignLicenses = useCallback( () => {
		// TODO: Implement issue and assign licenses
	}, [] );

	const handleIssueLicense = () => {
		if ( paymentMethodRequired ) {
			return setShowAddCard( true );
		}
		return issueAndAssignLicenses();
	};

	const handleGoBack = ( issueLicense = false ) => {
		setShowAddCard( false );
		if ( issueLicense ) {
			setPaymentMethodAdded( true );
		}
	};

	useEffect( () => {
		if ( paymentMethodAdded && ! paymentMethodRequired ) {
			setPaymentMethodAdded( false );
			issueAndAssignLicenses();
		}
	}, [ paymentMethodAdded, issueAndAssignLicenses, paymentMethodRequired ] );

	const mappedSelectedLicenses = [] as SelectedLicenseProp[];

	selectedLicenses.forEach( ( license ) => {
		license.products.forEach( ( product ) => {
			const productBundle = filteredProductsAndBundles.find(
				( productBundle ) => DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ product ] === productBundle.slug
			);

			if ( ! productBundle ) {
				return;
			}

			const foundBundle = mappedSelectedLicenses.find(
				( bundle ) => bundle.product_id === productBundle.product_id
			);

			if ( foundBundle ) {
				foundBundle.quantity++;
				foundBundle.siteUrls.push(
					sites.find( ( site ) => site.blog_id === license.siteId )?.url ?? ''
				);
				return;
			}

			mappedSelectedLicenses.push( {
				...productBundle,
				quantity: 1,
				siteUrls: [ sites.find( ( site ) => site.blog_id === license.siteId )?.url ?? '' ],
			} );
		} );
	} );

	return (
		<ReviewLicenses
			isMultiSiteSelect
			onClose={ onClose }
			selectedLicenses={ mappedSelectedLicenses }
			showAddCard={ showAddCard }
			handleIssueLicense={ handleIssueLicense }
			handleGoBack={ handleGoBack }
		/>
	);
}
