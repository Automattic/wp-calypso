/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import PaymentMethods from 'blocks/payment-methods';

class PlanFooter extends Component {

	constructor( props ) {
		super( props );
		this.state = {
			showMoneyBackGuarantee: abtest( 'showMoneyBackGuarantee' ) === 'yes',
		};
	}

	banner( side ) {
		return (
			<svg className={ 'plan-footer__banner is-' + side } width="50" height="35" xmlns="http://www.w3.org/2000/svg">
				<g fill="none" fill-rule="evenodd">
					<g stroke-width="2">
						<path stroke="#86A6BC" fill="#86A6BC" d="M41.522 2.488L4.093 12.518l15.47 6.207-8.631 12.665 36.975-9.907z" />
						<path stroke="#151E26" fill="#151E26" d="M27.882 10.606l19.199 9.832-3.883-14.49z" />
					</g>
				</g>
			</svg>
		);
	}

	render() {
		if ( ! this.props.isInSignup || ! this.state.showMoneyBackGuarantee ) {
			return (
				<PaymentMethods />
			);
		}
		return (
			<div className="plan-footer">
				<div className="plan-footer__guarantee">
					{ this.banner( 'left' ) }
					<div className="plan-footer__text">30 day money back guarantee</div>
					{ this.banner( 'right' ) }
				</div>
				<div className="plan-footer__fineprint">
					* Domains purchased with a plan are only refundable for 48 hours.
				</div>
			</div>
		);
	}
}
PlanFooter.propTypes = {
	isInSignup: PropTypes.bool,
};

PlanFooter.defaultProps = {
	isInSignup: false,
};

export default PlanFooter;
