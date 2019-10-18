/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { renderDisplayValueMarkdown } from '../index';

export function OrderReviewTotal( { total, className } ) {
	return (
		<div className={ joinClasses( [ className, 'order-review-total' ] ) }>
			<LineItemUI total item={ total } />
		</div>
	);
}

export function OrderReviewLineItems( { items, className } ) {
	return (
		<div className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ items.map( item => (
				<LineItemUI key={ item.id } item={ item } />
			) ) }
		</div>
	);
}

OrderReviewLineItems.propTypes = {
	className: PropTypes.string,
	items: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.string,
			amount: PropTypes.shape( {
				displayValue: PropTypes.string,
			} ),
		} )
	),
};

export function OrderReviewSection( { children, className, withDivider } ) {
	return (
		<OrderReviewSectionArea
			withDivider={ withDivider }
			className={ joinClasses( [ className, 'order-review-section' ] ) }
		>
			{ children }
		</OrderReviewSectionArea>
	);
}

OrderReviewSection.propTypes = {
	className: PropTypes.string,
	withDivider: PropTypes.bool,
};

const OrderReviewSectionArea = styled.div`
	margin-bottom: 16px;
	padding: ${props => ( props.withDivider ? '24px 0' : 0 )};
	border-bottom: ${props => ( props.withDivider ? '1px solid rgb(220, 220, 222)' : 'none' )};
`;

function LineItem( { item, className } ) {
	return (
		<div className={ joinClasses( [ className, 'checkout-line-item' ] ) }>
			<span>{ item.label }</span>
			<span>{ renderDisplayValueMarkdown( item.amount.displayValue ) }</span>
		</div>
	);
}

const LineItemUI = styled( LineItem )`
	display: flex;
	width: 100%;
	justify-content: space-between;
	font-weight: ${( { theme, total } ) => ( total ? theme.weights.bold : theme.weights.normal )};
`;

LineItem.propTypes = {
	className: PropTypes.string,
	total: PropTypes.bool,
	item: PropTypes.shape( {
		label: PropTypes.string,
		amount: PropTypes.shape( {
			displayValue: PropTypes.string,
		} ),
	} ),
};
