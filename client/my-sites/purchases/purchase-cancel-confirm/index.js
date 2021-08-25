import { Button, Fill } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import MaterialIcon from 'calypso/components/material-icon';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Feedback } from './steps/feedback';

import './style.scss';

const steps = [ Feedback ];

export const PurchaseCancelConfirm = ( { purchaseId, siteSlug } ) => {
	const [ currentStep ] = useState( 0 );
	const [ isValidStep, setIsValidStep ] = useState( false );

	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	const siteId = useSelector( getSelectedSiteId );

	const CurrentStepComponent = steps[ currentStep ];

	const backUrl = `/purchases/subscriptions/${ siteSlug }/${ purchaseId }/cancel`;

	return (
		<>
			<DocumentHead title={ __( 'Cancel and refund' ) } />
			<QuerySitePurchases siteId={ siteId } />
			<BlankCanvas backUrl={ backUrl }>
				<Fill name="BlankCanvas.Content">
					<CurrentStepComponent
						onValidate={ ( isValid ) => setIsValidStep( isValid ) }
						purchase={ purchase }
					/>
				</Fill>
				<Fill name="BlankCanvas.Footer">
					<div className="purchase-cancel-confirm__actions">
						<div className="purchase-cancel-confirm__buttons">
							<Button isPrimary href={ backUrl }>
								{ __( 'Keep my plan' ) }
							</Button>
							<Button isDefault disabled={ ! isValidStep }>
								{ __( 'Cancel plan' ) }
							</Button>
						</div>
						<Button
							icon={ () => <MaterialIcon icon="chat_bubble" /> }
							className="purchase-cancel-confirm__chat"
						>
							{ __( 'Need Help? Chat With Us' ) }
						</Button>
					</div>
				</Fill>
			</BlankCanvas>
		</>
	);
};
