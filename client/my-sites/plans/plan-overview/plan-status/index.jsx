/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PlanStatusProgress from './progress';
import ProgressBar from 'components/progress-bar';
import { isPremium, isBusiness } from 'lib/products-values';

const PlanStatus = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired
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

				<PlanStatusProgress plan={ this.props.plan } />
			</div>
		);
	}
} );

export default PlanStatus;
