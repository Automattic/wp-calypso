import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import {
	hasDomainBeingUsedForPlan,
	hasDomainRegistration,
	hasDomainRenewal,
	hasNewDomainRegistration,
} from 'calypso/lib/cart-values/cart-items';
import { DOMAIN_CANCEL, REFUNDS } from 'calypso/lib/url/support';
import CheckoutTermsItem from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms-item';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class DomainRefundPolicy extends Component {
	recordCancelDomainSupportClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Cancel Domain Support Link' );
	};

	recordRefundsSupportClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Refund Support Link' );
	};

	/**
	 * @returns {{}} Returns an object of renderable policies with unique keys.
	 */
	getApplicablePolicies = () => {
		let policies = {};

		if ( hasNewDomainRegistration( this.props.cart ) ) {
			policies = { ...policies, newDomain: this.renderNewPolicy() };
		}

		if ( hasDomainRenewal( this.props.cart ) ) {
			policies = { ...policies, renewal: this.renderRenewalPolicy() };
		}

		return policies;
	};

	renderNewPolicy = () => {
		const refundsSupportPage = (
			<a
				href={ REFUNDS }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ this.recordRefundsSupportClick }
			/>
		);

		let message = this.props.translate(
			'You understand that {{refundsSupportPage}}domain name refunds{{/refundsSupportPage}} are limited to 96 hours after registration.',
			{
				components: {
					refundsSupportPage: refundsSupportPage,
				},
			}
		);

		if ( hasDomainBeingUsedForPlan( this.props.cart ) ) {
			message = this.props.translate(
				'You understand that {{refundsSupportPage}}domain name refunds{{/refundsSupportPage}} are limited to 96 hours after registration. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.',
				{
					components: {
						refundsSupportPage: refundsSupportPage,
					},
				}
			);
		}

		return message;
	};

	renderRenewalPolicy = () => {
		return this.props.translate(
			'Please note: to receive a {{refundsSupportPage}}refund for a domain renewal{{/refundsSupportPage}}, you must {{cancelDomainSupportPage}}cancel your domain{{/cancelDomainSupportPage}} within 96 hours of the renewal transaction. Canceling the domain means it will be deleted and you may not be able to recover it.',
			{
				components: {
					cancelDomainSupportPage: (
						<a
							href={ localizeUrl( DOMAIN_CANCEL ) }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.recordCancelDomainSupportClick }
						/>
					),
					refundsSupportPage: (
						<a
							href={ localizeUrl( REFUNDS ) }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.recordRefundsSupportClick }
						/>
					),
				},
			}
		);
	};

	render() {
		if ( ! hasDomainRegistration( this.props.cart ) ) {
			return null;
		}

		const policies = this.getApplicablePolicies();

		return Object.entries( policies ).map( ( [ name, message ] ) => (
			<CheckoutTermsItem key={ 'domain-refund-policy-' + name }>{ message }</CheckoutTermsItem>
		) );
	}
}

export default localize( DomainRefundPolicy );
