/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import PaymentBox from './payment-box.jsx';

export function PendingPaymentBlocker( { translate } ) {
	return (
		<PaymentBox
			classSet="selected is-empty"
			contentClassSet="selected is-empty"
			title={ translate( 'Payment Pending' ) }
		>
			<div className="checkout__payment-box-sections">
				<p>
					{ translate(
						"Looks like you've recently made another purchase, and we're still processing that payment."
					) }
				</p>

				<p>
					{ translate(
						'Please wait for that payment to finish processing before buying something else -- use the "View Payment" button to check on the status. Thanks!'
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
