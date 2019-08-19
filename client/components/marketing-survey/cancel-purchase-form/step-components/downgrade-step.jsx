/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';

export class DowngradeStep extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		refundAmount: PropTypes.string,
		planCost: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		translate: noop,
	};

	onClick = () => {
		this.props.recordTracksEvent( 'calypso_cancellation_downgrade_step_click' );
	};

	render() {
		const { translate, refundAmount, planCost, currencySymbol } = this.props;
		const amount = currencySymbol + ( refundAmount ? refundAmount : planCost );

		return (
			<div>
				<FormSectionHeading>
					{ translate( 'Would you rather switch to a lower-tier plan?' ) }
				</FormSectionHeading>
				<FormFieldset>
					<p>
						{ refundAmount
							? translate(
									'You can downgrade to Personal and get a partial refund of %(amount)s or ' +
										'continue to the next step and cancel the plan.',
									{ args: { amount } }
							  )
							: translate(
									'You can downgrade to Personal and the new plan will renew at only %(amount)s.',
									{ args: { amount } }
							  ) }
					</p>
				</FormFieldset>
			</div>
		);
	}
}

const mapStateToProps = state => ( {
	selectedSite: getSelectedSite( state ),
} );
const mapDispatchToProps = { recordTracksEvent };

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( DowngradeStep ) );
