/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import { DOMAIN_CANCEL, REFUNDS } from 'lib/url/support';
import Gridicon from 'components/gridicon';
import {
	hasDomainBeingUsedForPlan,
	hasDomainRegistration,
	hasDomainRenewal,
	hasNewDomainRegistration,
} from 'lib/cart-values/cart-items';

class DomainRefundPolicy extends React.Component {
	recordCancelDomainSupportClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Cancel Domain Support Link' );
	};

	recordRefundsSupportClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Refund Support Link' );
	};

	/**
	 * @returns {[]} Returns an array of renderable policies.
	 */
	getApplicablePolicies = () => {
		const policies = [];

		if ( hasNewDomainRegistration( this.props.cart ) ) {
			policies.push( this.renderNewPolicy() );
		}

		if ( hasDomainRenewal( this.props.cart ) ) {
			policies.push( this.renderRenewalPolicy() );
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
							href={ DOMAIN_CANCEL }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.recordCancelDomainSupportClick }
						/>
					),
					refundsSupportPage: (
						<a
							href={ REFUNDS }
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

		return (
			<>
				{ policies.map( ( policy ) => (
					<div className="checkout__domain-refund-policy" key={ policy }>
						<Gridicon icon="info-outline" size={ 18 } />
						<p>{ policy }</p>
					</div>
				) ) }
			</>
		);
	}
}

export default localize( DomainRefundPolicy );
