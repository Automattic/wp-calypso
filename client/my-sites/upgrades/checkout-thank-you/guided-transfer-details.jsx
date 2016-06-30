/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import supportUrls from 'lib/url/support';
import PurchaseDetail from 'components/purchase-detail';

const GuidedTransferDetails = ( { translate } ) =>
	<PurchaseDetail
		icon="time"
		title={ translate( 'When will it be ready?' ) }
		description={ translate(
			'A Guided Transfer occurs over a 24 hour period. A Happiness Engineer ' +
			'will work with you to set up a day (during the work week) to perform ' +
			'the transfer.'
		) }
		buttonText={ translate( 'Learn more about Guided Transfers' ) }
		href={ supportUrls.GUIDED_TRANSFER }
		target="_blank"
	/>;

export default localize( GuidedTransferDetails );
