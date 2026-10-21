import { __, sprintf } from '@wordpress/i18n';
import React from 'react';
import useBillingSummaryQuery from 'calypso/data/promote-post/use-promote-post-billing-summary-query';

function DebtNotifier() {
	const { data } = useBillingSummaryQuery();
	const debt = data?.debt ?? '0.00';

	if ( debt !== '0.00' ) {
		return (
			<div className="promote-post-i2__debt-notifier">
				{
					/* translators: %s is the current debt amount in dollars */
					sprintf( __( 'Current debt is $%s.' ), debt.replace( '.00', '' ) )
				}
			</div>
		);
	}

	return '';
}

export default DebtNotifier;
