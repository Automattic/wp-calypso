/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ProgressBar from 'components/progress-bar';
import { isPremium, isBusiness } from 'lib/products-values';

const PlanStatus = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired
	},

	renderProgressBar() {
		const { subscribedMoment, userFacingExpiryMoment } = this.props.plan,
			timeConfig = { hour: 0, minute: 0, second: 0, millisecond: 0 },
			subscribedDayMoment = subscribedMoment.set( timeConfig ),
			// we strip the hour/minute/second/millisecond data here from `subscribed_date` to match `expiry`
			trialPeriodInDays = userFacingExpiryMoment.diff( subscribedDayMoment, 'days' ),
			todayMoment = this.moment().set( timeConfig ),
			timeUntilExpiryInDays = userFacingExpiryMoment.diff( todayMoment, 'days' );

		return (
			<ProgressBar
				value={ trialPeriodInDays - timeUntilExpiryInDays }
				total={ trialPeriodInDays } />
		);
	},

	render() {
		const { plan } = this.props,
			iconClasses = classNames( 'plan-status__icon', {
				'is-premium': isPremium( plan ),
				'is-business': isBusiness( plan )
			} );

		return (
			<div className="plan-status">
				<CompactCard className="plan-status__info">
					<div className={ iconClasses } />
					<div className="plan-status__header">
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
					</div>
				</CompactCard>
				<CompactCard>
					<div className="plan-status__time-until-expiry">
						{
							this.translate( '%(timeUntilExpiry)s remaining', {
								args: { timeUntilExpiry: this.props.plan.userFacingExpiryMoment.toNow( true ) },
								context: 'The amount of time until the trial plan expires, e.g. "5 days remaining"'
							} )
						}
					</div>
					<div className="plan-status__progress">
						{ this.renderProgressBar() }
					</div>
				</CompactCard>
			</div>
		);
	}
} );

export default PlanStatus;
