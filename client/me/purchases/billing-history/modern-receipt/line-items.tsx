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
				<tr key={ item.id } className="receipt__item">
					<td className="receipt__item-details">
						<div className="receipt__item-name">{ item.variation }</div>
						<div className="receipt__item-type">({ item.type_localized })</div>
						{ getTransactionTermLabel( item, translate ) && (
							<div className="receipt__item-term">
								{ getTransactionTermLabel( item, translate ) }
							</div>
						) }
						{ item.domain && <div className="receipt__item-domain">{ item.domain }</div> }
						{ item.licensed_quantity && (
							<div className="receipt__item-quantity">
								{ renderTransactionQuantitySummary( item, translate ) }
							</div>
						) }
						{ isTransactionJetpackSearch10kTier( item ) && (
							<div className="receipt__item-tier">
								{ renderJetpackSearch10kTierBreakdown( item, item.subtotal_integer, translate ) }
							</div>
						) }
						{ item.volume && (
							<div className="receipt__item-volume">
								{ renderDomainTransactionVolumeSummary( item, translate ) }
							</div>
						) }
					</td>
					<td className="receipt__amount">
						{ formatCurrency( item.amount_integer, item.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ) }
						{ transaction.credit && (
							<span className="receipt__refund-badge">{ translate( 'Refund' ) }</span>
						) }
					</td>
				</tr>
			) ) }
			{ transactionIncludesTax( transaction ) && (
				<tr className="receipt__tax">
					<td>{ translate( 'Tax' ) }</td>
					<td className="receipt__amount">
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
