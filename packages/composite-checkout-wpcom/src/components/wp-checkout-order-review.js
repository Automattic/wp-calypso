/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useLineItems, useFormStatus } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Coupon from './coupon';
import WPTermsAndConditions from './wp-terms-and-conditions';
import {
	WPOrderReviewLineItems,
	WPOrderReviewTotal,
	WPOrderReviewSection,
} from './wp-order-review-line-items';

export default function WPCheckoutOrderReview( { className, removeItem } ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();

	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			<WPOrderReviewSection>
				<WPOrderReviewLineItems items={ items } removeItem={ removeItem } />
			</WPOrderReviewSection>

			<CouponField id="order-review-coupon" disabled={ formStatus !== 'ready' } />

			<WPOrderReviewSection>
				<WPOrderReviewTotal total={ total } />
			</WPOrderReviewSection>

			<WPTermsAndConditions />
		</div>
	);
}

WPCheckoutOrderReview.propTypes = {
	summary: PropTypes.bool,
	className: PropTypes.string,
	removeItem: PropTypes.func.isRequired,
};

const CouponField = styled( Coupon )`
	margin: 24px 30px 24px 0;
	padding-bottom: 24px;
	border-bottom: 1px solid ${props => props.theme.colors.borderColorLight};
`;
