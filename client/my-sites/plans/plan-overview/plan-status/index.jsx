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

	getDaysUntilExpiry() {
		const { userFacingExpiryMoment } = this.props.plan;

		return userFacingExpiryMoment.diff( this.moment(), 'days' );
	},

	renderProgressBar() {
		const { subscribedMoment, userFacingExpiryMoment } = this.props.plan,
			// we strip the hour/minute/second/millisecond data here from `subscribed_date` to match `expiry`
			trialPeriodInDays = userFacingExpiryMoment.diff( subscribedMoment, 'days' ),
			timeUntilExpiryInDays = this.getDaysUntilExpiry(),
			progress = Math.max( 0.5, trialPeriodInDays - timeUntilExpiryInDays );

		return (
			<ProgressBar
				value={ progress }
				total={ trialPeriodInDays } />
		);
	},

	renderDaysRemaining() {
		return this.translate(
			'%(daysUntilExpiry)s day remaining',
			'%(daysUntilExpiry)s days remaining',
			{
				args: { daysUntilExpiry: this.getDaysUntilExpiry() },
				count: this.getDaysUntilExpiry(),
				context: 'The amount of time until the trial plan expires, e.g. "5 days remaining"'
			}
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
						{ this.renderDaysRemaining() }
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
