import { Button, Card } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { billingHistory } from 'calypso/me/purchases/paths';
import { useDispatch } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail } from 'calypso/state/billing-transactions/actions';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import isPastBillingTransactionError from 'calypso/state/selectors/is-past-billing-transaction-error';
import { ReceiptContent } from './content';
import { ReceiptPlaceholder } from './placeholder';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';
import type { IAppState } from 'calypso/state/types';

import './style.scss';

interface ReceiptProps {
	transactionId: number;
}

export default function ModernReceipt( { transactionId }: ReceiptProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const transaction = useSelector( ( state: IAppState ) =>
		getPastBillingTransaction( state, transactionId )
	) as BillingTransaction | undefined;

	const transactionError = useSelector( ( state: IAppState ) =>
		isPastBillingTransactionError( state, transactionId )
	);

	const isLoading = ! transaction && ! transactionError;

	const handlePrint = useCallback( () => {
		dispatch(
			recordGoogleEvent( 'Me', 'Clicked on Print Receipt Button in Billing History Receipt' )
		);
		window.print();
	}, [ dispatch ] );

	const handleEmailReceipt = useCallback( () => {
		dispatch( recordGoogleEvent( 'Me', 'Clicked on Email Receipt Button' ) );
		dispatch( sendBillingReceiptEmail( transactionId.toString() ) );
	}, [ dispatch, transactionId ] );

	return (
		<Main wideLayout id="modern-receipt" className="receipt">
			<DocumentHead title={ translate( 'Billing History' ) } />
			<PageViewTracker
				path="/me/purchases/billing/:receipt"
				title="Me > Billing History > Receipt"
			/>
			<QueryBillingTransaction transactionId={ transactionId } />

			{ isLoading && <ReceiptPlaceholder /> }

			{ transactionError && (
				<Card className="receipt__error">
					<p>{ translate( "Sorry, we couldn't load this receipt. Please try again later." ) }</p>
					<Button href={ billingHistory } variant="primary">
						{ translate( 'Return to Billing History' ) }
					</Button>
				</Card>
			) }

			{ ! isLoading && ! transactionError && transaction && (
				<>
					<div className="receipt__page-header">
						<div className="receipt__breadcrumbs">
							<a href={ billingHistory } className="receipt__back-link">
								{ translate( 'Receipts' ) }
							</a>
						</div>
						<div className="receipt__title-bar">
							<h1 className="receipt__title">
								{ translate( 'Receipt %(id)s', { args: { id: transactionId } } ) }
							</h1>
							<div className="receipt__actions">
								<Button variant="primary" onClick={ handlePrint }>
									{ translate( 'Print Receipt' ) }
								</Button>
								<Button variant="primary" onClick={ handleEmailReceipt }>
									{ translate( 'Email Receipt' ) }
								</Button>
							</div>
						</div>
					</div>

					<ReceiptContent transaction={ transaction } />
				</>
			) }
		</Main>
	);
}
