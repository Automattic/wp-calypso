/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';

export default localize( ( { translate } ) => {
	return (
		<div className="plan-purchase-features__item">
			<PurchaseDetail
				icon="list-checkmark"
				title={ translate( 'Surveys & Polls' ) }
				description={ translate(
					'Unlimited surveys, unlimited responses. Use the survey editor to create surveys quickly and easily. Collect ' +
					'responses via your website, e-mail or on your iPad or iPhone'
				) }
				buttonText={ translate( 'Create a new poll' ) }
				href="https://polldaddy.com/dashboard/"
			/>
		</div>
	);
} );
