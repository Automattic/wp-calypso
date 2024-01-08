import { useCallback, useEffect, useState } from 'react';
import useMultipleIssueAndAssignLicenses from 'calypso/jetpack-cloud/sections/partner-portal/hooks/use-multiple-issue-and-assign-licenses';
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

	const { issueAndAssign, status } = useMultipleIssueAndAssignLicenses();

	const issueAndAssignLicenses = useCallback( () => {
		const allLicenses = [] as Array< { slug: string; siteId: number } >;
		selectedLicenses.forEach( ( license ) => {
			license.products.forEach( ( product ) => {
				const productBundle = filteredProductsAndBundles.find(
					( productBundle ) => DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ product ] === productBundle.slug
				);

				if ( ! productBundle ) {
					return;
				}

				allLicenses.push( {
					siteId: license.siteId,
					slug: productBundle.slug,
				} );
			} );
		} );
		issueAndAssign( allLicenses );
	}, [ filteredProductsAndBundles, issueAndAssign, selectedLicenses ] );

	const isLoading = status.some( ( item ) => item.status === 'loading' );
	const isSuccessful =
		status.length > 0 &&
		status.every( ( item ) => item.status === 'success' && item.type === 'assign-license' );

	console.log( 'status', status );

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
		if ( isSuccessful ) {
			onClose();
		}
	}, [ isSuccessful, onClose ] );

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
			isLoading={ isLoading }
		/>
	);
}
