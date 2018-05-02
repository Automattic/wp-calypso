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

	showTestVariant() {
		// only in signup, and not for Jetpack plans.
		if ( ! this.props.isInSignup || this.props.isJetpack ) {
			return false;
		}
		return abtest( 'showMoneyBackGuarantee' ) === 'yes';
	}

	render() {
		if ( ! this.showTestVariant() ) {
			return (
				<PaymentMethods />
			);
		}
		return (
			<div className="plan-footer">
				<div className="plan-footer__guarantee">
					<div className="plan-footer__text">30-day money back guarantee on all plans</div>
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
	isJetpack: PropTypes.bool,
};

PlanFooter.defaultProps = {
	isInSignup: false,
	isJetpack: false,
};

export default PlanFooter;
