/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { getDaysUntilExpiry, getDaysUntilUserFacingExpiry, isInGracePeriod } from 'lib/plans';
import ProgressBar from 'components/progress-bar';

const PlanStatusProgress = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired
	},

	renderProgressBar() {
		const { plan, plan: { subscribedMoment, userFacingExpiryMoment } } = this.props,
			// we strip the hour/minute/second/millisecond data here from `subscribed_date` to match `expiry`
			trialPeriodInDays = userFacingExpiryMoment.diff( subscribedMoment, 'days' ),
			timeUntilExpiryInDays = getDaysUntilUserFacingExpiry( plan ),
			progress = Math.max( 0.5, trialPeriodInDays - timeUntilExpiryInDays );

		return (
			<ProgressBar
				value={ progress }
				total={ trialPeriodInDays }
			/>
		);
	},

	renderDaysRemaining() {
		const { plan } = this.props;

		if ( isInGracePeriod( plan ) ) {
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
			classes = classNames( 'plan-status__progress', {
				'is-expiring': getDaysUntilUserFacingExpiry( plan ) < 6 && ! isInGracePeriod( plan ),
				'is-in-grace-period': isInGracePeriod( plan )
			} );

		return (
			<CompactCard>
				<div className={ classes }>
					<div className="plan-status__progress-time-until-expiry">
						{ this.renderDaysRemaining() }
					</div>

					<div className="plan-status__progress-bar">
						{ this.renderProgressBar() }
					</div>
				</div>
			</CompactCard>
		);
	}
} );

export default PlanStatusProgress;
