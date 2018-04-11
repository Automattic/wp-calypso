/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import Gridicon from 'gridicons';
import PaymentMethods from 'blocks/payment-methods';

class PlanFooter extends Component {

	constructor( props ) {
		super( props );
		this.state = {
			showMoneyBackGuarantee: abtest( 'showMoneyBackGuarantee' ) === 'yes',
		};
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
					<Gridicon icon="checkmark-circle" size="18" />
					30 day money back guarantee*
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
