import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import {
	groupDomainProducts,
	getTransactionTermLabel,
	renderTransactionQuantitySummary,
	isTransactionJetpackSearch10kTier,
	renderJetpackSearch10kTierBreakdown,
	renderDomainTransactionVolumeSummary,
	transactionIncludesTax,
} from '../utils';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

interface ReceiptLineItemsProps {
	transaction: BillingTransaction;
}

export function ReceiptLineItems( { transaction }: ReceiptLineItemsProps ) {
	const translate = useTranslate();
	const items = groupDomainProducts( transaction.items, translate );

	return (
		<>
			{ items.map( ( item ) => (
				<tr key={ item.id } className="item">
					<td className="item-details">
						<div className="item-name">{ item.variation }</div>
						<div className="item-type">({ item.type_localized })</div>
						{ getTransactionTermLabel( item, translate ) && (
							<div className="item-term">{ getTransactionTermLabel( item, translate ) }</div>
						) }
						{ item.domain && <div className="item-domain">{ item.domain }</div> }
						{ item.licensed_quantity && (
							<div className="item-quantity">
								{ renderTransactionQuantitySummary( item, translate ) }
							</div>
						) }
						{ isTransactionJetpackSearch10kTier( item ) && (
							<div className="item-tier">
								{ renderJetpackSearch10kTierBreakdown( item, item.subtotal_integer, translate ) }
							</div>
						) }
						{ item.volume && (
							<div className="item-volume">
								{ renderDomainTransactionVolumeSummary( item, translate ) }
							</div>
						) }
					</td>
					<td className="amount">
						{ formatCurrency( item.amount_integer, item.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ) }
						{ transaction.credit && (
							<span className="credit-badge">{ translate( 'Refund' ) }</span>
						) }
					</td>
				</tr>
			) ) }
			{ transactionIncludesTax( transaction ) && (
				<tr className="tax">
					<td>{ translate( 'Tax' ) }</td>
					<td className="amount">
						{ formatCurrency( transaction.tax_integer, transaction.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ) }
					</td>
				</tr>
			) }
		</>
	);
}
