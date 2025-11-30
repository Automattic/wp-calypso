import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import RefundAmountString from './refund-amount-string';
import type { Purchase } from '@automattic/api-core';

interface CancellationFullTextProps {
	purchase: Purchase;
	cancelBundledDomain: boolean;
	includedDomainPurchase?: Purchase;
}

export default function CancellationFullText( {
	purchase,
	cancelBundledDomain,
	includedDomainPurchase,
}: CancellationFullTextProps ) {
	const { expiry_date: expiryDate } = purchase;
	const expirationDate = intlFormat( expiryDate, { dateStyle: 'medium' }, { locale: 'en-US' } );

	const refundAmountString = RefundAmountString( {
		purchase,
		cancelBundledDomain,
		includedDomainPurchase,
	} );

	if ( refundAmountString ) {
		return createInterpolateElement(
			sprintf(
				/* translators: $(refundText)s is of the form "[currency-symbol][amount]" i.e. "$20" */
				__(
					'If you confirm this cancellation, you will receive a <span>refund of %(refundText)s</span>, and your subscription will be removed immediately.'
				),
				{
					refundText: refundAmountString,
				}
			),
			{
				span: <span className="cancel-purchase__refund-string" />,
			}
		);
	}

	return createInterpolateElement(
		sprintf(
			/* translators: %(expirationDate)s is the date when the subscription will be removed */
			__(
				'If you complete this cancellation, your subscription will be removed on <span>%(expirationDate)s</span>.'
			),
			{
				expirationDate,
			}
		),
		{
			span: <span className="cancel-purchase__warning-string" />,
		}
	);
}
