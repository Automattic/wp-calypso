/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import ProgressBar from 'components/progress-bar';

const PlanStatus = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired
	},

	renderProgressBar() {
		const { subscribedMoment, userFacingExpiryMoment } = this.props.plan,
			subscribedDayMoment = subscribedMoment.set( { hour: 0, minute: 0, second: 0, millisecond: 0 } ),
			// we strip the hour/minute/second/millisecond data here from `subscribed_date` to match `expiry`
			trialPeriodInDays = userFacingExpiryMoment.diff( subscribedDayMoment, 'days' ),
			todayMoment = this.moment().set( { hour: 0, minute: 0, second: 0, millisecond: 0 } ),
			timeUntilExpiryInDays = userFacingExpiryMoment.diff( todayMoment, 'days' );

		return (
			<ProgressBar
				value={ trialPeriodInDays - timeUntilExpiryInDays }
				total={ trialPeriodInDays } />
		);
	},

	render() {
		return (
			<span>
				<Card>
					<span className="plan-status__text">
						{ this.translate( 'Your Current Plan:' ) }
					</span>
					<h1 className="plan-status__plan">
						{
							this.translate( '%(planName)s Free Trial', {
								args: { planName: this.props.plan.productName }
							} )
						}
					</h1>
				</Card>
				<CompactCard>
					<span className="plan-status__time-until-expiry">
						{
							this.translate( '%(timeUntilExpiry)s remaining', {
								args: { timeUntilExpiry: this.props.plan.userFacingExpiryMoment.toNow( true ) },
								context: 'The amount of time until the trial plan expires, e.g. "5 days remaining"'
							} )
						}
					</span>
					{ this.renderProgressBar() }
				</CompactCard>
			</span>
		);
	}
} );

export default PlanStatus;
