/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PaymentBox from './payment-box.jsx';

export function PendingPaymentBlocker( { translate } ) {
	return (
		<PaymentBox
			classSet="selected is-empty"
			contentClassSet="selected is-empty"
			title={ translate( 'Payment Pending' ) }
		>
			<div className="checkout__payment-box-sections">
				<p>{ translate( "Your previous order's payment is still being processed." ) }</p>
				<p>
					{ translate(
						'Please wait for the previous payment to process before proceeding with a new purchase.'
					) }
				</p>

				<div className="checkout__payment-box-actions">
					<div className="checkout__payment-buttons  payment-box__payment-buttons">
						<div className="checkout__payment-button pay-button">
							<Button primary={ true } href="/me/purchases/pending">
								<span>{ translate( 'View Payment' ) }</span>
							</Button>
						</div>
						<div className="checkout__payment-button pay-button">
							<Button primary={ false } href="/help/contact">
								<Gridicon icon="help" />
								<span>{ translate( 'Contact Support' ) }</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</PaymentBox>
	);
}

export default localize( PendingPaymentBlocker );
