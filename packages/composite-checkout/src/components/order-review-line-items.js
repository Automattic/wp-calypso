/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { renderDisplayValueMarkdown } from '../public-api';

export function OrderReviewSection( { children, className } ) {
	return (
		<OrderReviewSectionArea className={ joinClasses( [ className, 'order-review-section' ] ) }>
			{ children }
		</OrderReviewSectionArea>
	);
}

OrderReviewSection.propTypes = {
	className: PropTypes.string,
};

const OrderReviewSectionArea = styled.div`
	margin-bottom: 16px;
`;

function LineItem( { item, className } ) {
	const itemSpanId = `checkout-line-item-${ item.id }`;
	return (
		<div className={ joinClasses( [ className, 'checkout-line-item' ] ) }>
			<span id={ itemSpanId }>{ item.label }</span>
			<span aria-labelledby={ itemSpanId }>
				{ renderDisplayValueMarkdown( item.amount.displayValue ) }
			</span>
		</div>
	);
}

LineItem.propTypes = {
	className: PropTypes.string,
	total: PropTypes.bool,
	isSummaryVisible: PropTypes.bool,
	item: PropTypes.shape( {
		label: PropTypes.string,
		amount: PropTypes.shape( {
			displayValue: PropTypes.string,
		} ),
	} ),
};

const LineItemUI = styled( LineItem )`
	display: flex;
	width: 100%;
	justify-content: space-between;
	font-weight: ${( { theme, total } ) => ( total ? theme.weights.bold : theme.weights.normal) };
	color: ${( { theme, total } ) => ( total ? theme.colors.textColorDark : 'inherit') };
	font-size: ${( { total } ) => ( total ? '1.2em' : '1em') };
	padding: ${( { total, isSummaryVisible } ) => ( isSummaryVisible || total ? 0 : '24px 0') };
	border-bottom: ${( { theme, total, isSummaryVisible } ) =>
		isSummaryVisible || total ? 0 : '1px solid ' + theme.colors.borderColorLight};

	:first-of-type {
		padding-top: 0;
	}
`;

export function OrderReviewTotal( { total, className } ) {
	return (
		<div className={ joinClasses( [ className, 'order-review-total' ] ) }>
			<LineItemUI total item={ total } />
		</div>
	);
}

export function OrderReviewLineItems( { items, className, isSummaryVisible } ) {
	return (
		<div className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ items.map( ( item ) => (
				<LineItemUI isSummaryVisible={ isSummaryVisible } key={ item.id } item={ item } />
			) ) }
		</div>
	);
}

OrderReviewLineItems.propTypes = {
	className: PropTypes.string,
	isSummaryVisible: PropTypes.bool,
	items: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.string,
			amount: PropTypes.shape( {
				displayValue: PropTypes.string,
			} ),
		} )
	),
};
