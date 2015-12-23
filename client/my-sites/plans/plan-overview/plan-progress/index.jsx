/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { getCurrentTrialPeriodInDays, getDaysUntilExpiry, getDaysUntilUserFacingExpiry, isInGracePeriod } from 'lib/plans';
import ProgressBar from 'components/progress-bar';

const PlanProgress = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired
	},

	/*
	 *          |------------------------trialPeriodInDays (17 days)-------------------|
	 *     plan.subscribedDate (datetime)       plan.userFacingExpiry (day)       plan.expiry (day)
	 *          |-----------------------------------------|----gracePeriod (3 days)----|
	 *          |                                         |                            |
	 * -> Today before user facing expiry:
	 *                  today
	 *          |         |-----timeUntilExpiryInDays-----|                            |
	 * -> Today is in grace period:
	 *                                                       today
	 *          |                                         |    |-timeUntilExpiryInDays-|
	 * -> Today is after trial period in days:
	 *                                                                                     today
	 *          |                                         |                            |
	 *     timeUntilExpiryInDays = 0
	 */
	renderProgressBar() {
		const { plan } = this.props,
			trialPeriodInDays = getCurrentTrialPeriodInDays( plan ),
			timeUntilExpiryInDays = isInGracePeriod( plan )
				? Math.max( getDaysUntilExpiry( plan ), 0 )
				: getDaysUntilUserFacingExpiry( plan ),
			// set minimum progress to 0.5 to show that the trial started immediately
			progress = Math.max( 0.5, trialPeriodInDays - timeUntilExpiryInDays );

		return (
			<ProgressBar
				value={ progress }
				total={ trialPeriodInDays } />
		);
	},

	renderDaysRemaining() {
		const { plan } = this.props;

		if ( isInGracePeriod( plan ) ) {
			if ( getDaysUntilExpiry( plan ) <= 0 ) {
				return this.translate( 'Plan features will be removed momentarily' );
			}

			return this.translate(
				'Plan features will be removed in %(daysUntilExpiry)s day',
				'Plan features will be removed in %(daysUntilExpiry)s days',
				{
					args: { daysUntilExpiry: getDaysUntilExpiry( plan ) },
					count: getDaysUntilExpiry( plan ),
					context: "The amount of time until the trial plan is removed from the user's account."
				}
			);
		}

		return this.translate(
			'%(daysUntilExpiry)d day remaining',
			'%(daysUntilExpiry)d days remaining',
			{
				args: { daysUntilExpiry: getDaysUntilUserFacingExpiry( plan ) },
				count: getDaysUntilUserFacingExpiry( plan ),
				context: 'The amount of time until the trial plan expires, e.g. "5 days remaining"'
			}
		);
	},

	render() {
		const { plan } = this.props,
			classes = classNames( 'plan-progress', {
				'is-expiring': getDaysUntilUserFacingExpiry( plan ) < 6 && ! isInGracePeriod( plan ),
				'is-in-grace-period': isInGracePeriod( plan )
			} );

		return (
			<CompactCard>
				<div className={ classes }>
					<div className="plan-progress__time-until-expiry">
						{ this.renderDaysRemaining() }
					</div>

					<div className="plan-progress__bar">
						{ this.renderProgressBar() }
					</div>
				</div>
			</CompactCard>
		);
	}
} );

export default PlanProgress;
