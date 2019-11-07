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
import { useLineItems, renderDisplayValueMarkdown, useHasDomainsInCart } from '../public-api';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './order-review-line-items';

export default function CheckoutReviewOrder( { className } ) {
	const [ items, total ] = useLineItems();

	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			<OrderReviewSection>
				<OrderReviewLineItems items={ items } />
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewTotal total={ total } />
			</OrderReviewSection>
			<TermsAndConditions />
		</div>
	);
}

CheckoutReviewOrder.propTypes = {
	isActive: PropTypes.bool.isRequired,
	summary: PropTypes.bool,
	className: PropTypes.string,
};

function LineItem( { item, className } ) {
	return (
		<div className={ joinClasses( [ className, 'checkout-line-item' ] ) }>
			<span>•</span>
			<span>{ item.label }</span>
			<span>{ renderDisplayValueMarkdown( item.amount.displayValue ) }</span>
		</div>
	);
}

LineItem.propTypes = {
	item: PropTypes.shape( {
		label: PropTypes.string,
		amount: PropTypes.shape( {
			displayValue: PropTypes.string,
		} ),
	} ),
};

function TermsAndConditions() {
	const isDomainsTermsVisible = useHasDomainsInCart();

	return (
		<TermsAndConditionsWrapper>
			<TermsParagraph>
				<strong>By checking out:</strong> you agree to our{' '}
				<a href="https://wordpress.com/tos/" target="_blank" rel="noopener noreferrer">
					Terms of Service
				</a>{' '}
				and authorize your payment method to be charged on a recurring basis until you cancel, which
				you can do at any time. You understand{' '}
				<a
					href="https://en.support.wordpress.com/manage-purchases/#automatic-renewal"
					target="_blank"
					rel="noopener noreferrer"
				>
					how your subscription works
				</a>{' '}
				and{' '}
				<a
					href="https://en.support.wordpress.com/manage-purchases/#FAQ-Cancelling"
					target="_blank"
					rel="noopener noreferrer"
				>
					how to cancel
				</a>
				.
			</TermsParagraph>
			{ isDomainsTermsVisible && (
				<React.Fragment>
					<TermsParagraph>
						You agree to the{' '}
						<a
							href="https://wordpress.com/automattic-domain-name-registration-agreement/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Domain Registration Agreement
						</a>{' '}
						for domainname.com.
					</TermsParagraph>
					<TermsParagraph>
						You understand that{' '}
						<a
							href="https://en.support.wordpress.com/manage-purchases/#refund-policy"
							target="_blank"
							rel="noopener noreferrer"
						>
							domain name refunds
						</a>{' '}
						are limited to 96 hours after registration. Refunds of paid plans will deduct the
						standard cost of any domain name registered within a plan.
					</TermsParagraph>
				</React.Fragment>
			) }
		</TermsAndConditionsWrapper>
	);
}

const TermsAndConditionsWrapper = styled.div`
	padding: 24px 0 0;
	margin-top: 16px;
	border-top: 1px solid ${props => props.theme.colors.borderColorLight};
`;

const TermsParagraph = styled.p`
	margin: 16px 0 0;
	font-size: 14px;
	color: ${props => props.theme.colors.textColor};

	a {
		color: ${props => props.theme.colors.textColor};
	}

	a:hover {
		text-decoration: none;
	}

	a:active {
		text-decoration: underline;
	}

	:first-child {
		margin-top: 0;
	}
`;
