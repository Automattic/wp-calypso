/**
 * External dependencies
 */
import React from 'react';
import { OrderReviewLineItems, OrderReviewTotal } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { PlanItem, DomainItem, TaxItem } from './items';

export function OrderReview( { items, total, onDeleteItem, onChangePlanLength } ) {
	return (
		<React.Fragment>
			{ partitionItems( items ).map( group => {
				return (
					<OrderReviewGroup
						key={ group.groupLabel }
						groupItems={ group.groupItems }
						onDeleteItem={ onDeleteItem }
						onChangePlanLength={ onChangePlanLength }
					/>
				);
			} ) }
			<OrderReviewTotal total={ total } className={ 'order-review__total' } />
		</React.Fragment>
	);
}

export function OrderReviewCollapsed( { useShoppingCart } ) {
	const { items, total } = useShoppingCart();
	const planItems = items.filter( item => item.type === 'plan' );
	const domainItems = items.filter( item => item.type === 'domain' );
	const miscItems = items.filter( item => ! [ 'plan', 'domain', 'tax' ].includes( item.type ) );

	return (
		<React.Fragment>
			<OrderReviewLineItems collapsed items={ planItems } />
			<OrderReviewLineItems collapsed items={ miscItems } />
			<OrderReviewLineItems collapsed items={ domainItems } />
			<OrderReviewTotal collapsed total={ total } />
		</React.Fragment>
	);
}

/**
 * Arrange cart items into groups. Any logic concerning
 * how cart items are ordered and grouped in the checkout
 * belongs here.
 *
 * @param {[{object}]} items Array of cart items
 * @returns {[object]} Nested array of item groups, in order
 *   [ { groupLabel: string
 *     , groupItems:
 *       [ { label: string
 *         , sublabel: string
 *         , type: string
 *         , amount:
 *           { value: int
 *           , currency: string
 *           , displayValue: string
 *           }
 *         , wpcom_meta:
 *           { uuid: int
 *           , plan_length: string
 *           , group_slug: string
 *           }
 *         }
 *       ]
 *     }
 *   ]
 */
function partitionItems( items ) {
	return [ { groupLabel: 'all', groupItems: items } ];
}

function OrderReviewGroup( { groupItems, onDeleteItem, onChangePlanLength } ) {
	return groupItems.map( convertItemToComponent( onDeleteItem, onChangePlanLength ) );
}

/**
 * Return a function which converts a single cart item
 * into a component.
 *
 * @param {Function} onDeleteItem Delete callback
 * @param {Function} onChangePlanLength Plan length change callback
 * @returns {Function} Item component
 */
function convertItemToComponent( onDeleteItem, onChangePlanLength ) {
	return item => {
		switch ( item.type ) {
			case 'tax':
				return <TaxItem key={ item.label } item={ item } />;

			case 'personal-bundle':
			case 'premium-bundle':
				return (
					<PlanItem
						key={ item.wpcom_meta.uuid }
						item={ item }
						onDeleteItem={ onDeleteItem }
						onChangePlanLength={ onChangePlanLength }
					/>
				);

			case 'domain':
				return (
					<DomainItem key={ item.wpcom_meta.uuid } item={ item } onDeleteItem={ onDeleteItem } />
				);
		}
	};
}
