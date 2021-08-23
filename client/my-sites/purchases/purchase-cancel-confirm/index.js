import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Feedback } from './steps/feedback';

const steps = [ Feedback ];

export const PurchaseCancelConfirm = ( { purchaseId, siteSlug } ) => {
	const [ currentStep ] = useState( 0 );

	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	const siteId = useSelector( getSelectedSiteId );

	const CurrentStepComponent = steps[ currentStep ];

	return (
		<>
			<DocumentHead title={ __( 'Cancel and refund' ) } />
			<QuerySitePurchases siteId={ siteId } />
			<BlankCanvas backUrl={ `/purchases/subscriptions/${ siteSlug }/${ purchaseId }/cancel` }>
				<CurrentStepComponent purchase={ purchase } />
			</BlankCanvas>
		</>
	);
};
