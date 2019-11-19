/**
 * External dependencies
 */
import React from 'react';
import { renderDisplayValueMarkdown } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

export function PlanItem( { item, onDeleteItem, onChangePlanLength } ) {
	const translate = useTranslate();
	const changePlanLength = planLength => onChangePlanLength( item, planLength );
	const deleteItem = () => onDeleteItem( item );
	const itemSpanId = `checkout-line-item-${ item.wpcom_meta.uuid }`;
	return (
		<React.Fragment>
			<div>
				<span>
					<div id={ itemSpanId }>{ item.label }</div>
					{ item.subLabel && <div>{ item.subLabel }</div> }
				</span>
				<span aria-labelledby={ itemSpanId }>
					{ renderDisplayValueMarkdown( item.amount.displayValue ) }
				</span>
				<button onClick={ deleteItem }>{ translate( 'Delete' ) }</button>
			</div>
			<PlanLengthSelector onChange={ changePlanLength } />
		</React.Fragment>
	);
}

export function DomainItem( { item, onDeleteItem } ) {
	const translate = useTranslate();
	const deleteItem = () => onDeleteItem( item );
	const itemSpanId = `checkout-line-item-${ item.wpcom_meta.uuid }`;
	return (
		<div>
			<span>
				<div id={ itemSpanId }>{ item.label }</div>
				{ item.subLabel && <div>{ item.subLabel }</div> }
			</span>
			<span aria-labelledby={ itemSpanId }>
				{ renderDisplayValueMarkdown( item.amount.displayValue ) }
			</span>
			<button onClick={ deleteItem }>{ translate( 'Delete' ) }</button>
		</div>
	);
}

export function TaxItem( { item } ) {
	const taxSpanId = 'checkout-tax-line-item';
	return (
		<div>
			<span>
				<div id={ taxSpanId }>{ item.label }</div>
				{ item.subLabel && <div>{ item.subLabel }</div> }
			</span>
			<span aria-labelledby={ taxSpanId }>
				{ renderDisplayValueMarkdown( item.amount.displayValue ) }
			</span>
		</div>
	);
}

function PlanLengthSelector() {
	return <span>TODO</span>;
}
