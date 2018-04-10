/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';

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
					<Gridicon icon="checkmark-circle" />
					{ translate( '30 day money back guarantee*', {
						comment: '* is for a footnote to follow',
					} ) }
				</div>
				<PaymentMethods />
				<div className="plan-footer__fineprint">
					{ translate( '* Domains purchased with a plan are only refundable for 48 hours.', {
						comment: '* is a leading footnote indicator',
					} ) }
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
