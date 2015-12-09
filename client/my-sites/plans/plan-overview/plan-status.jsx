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
								args: { timeUntilExpiry: this.props.plan.expiryMoment.toNow( true ) },
								context: 'The amount of time until the trial plan expires, e.g. "5 days remaining"'
							} )
						}
					</span>
				</CompactCard>
				{ this.props.plan.subscribedMoment.format( 'LL' ) }
			</span>
		);
	}
} );

export default PlanStatus;
