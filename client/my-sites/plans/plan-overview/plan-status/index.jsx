/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import PlanStatusProgress from './progress';
import ProgressBar from 'components/progress-bar';
import { isPremium, isBusiness } from 'lib/products-values';
import * as upgradesActions from 'lib/upgrades/actions';

const PlanStatus = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	purchasePlan() {
		upgradesActions.addItem( cartItems.planItem( this.props.plan.productSlug ) );

		page( `/checkout/${ this.props.selectedSite.slug }` );
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
									args: { planName: plan.productName }
								} )
							}
						</h1>
					</div>

					<Button
						className="plan-status__button"
						onClick={ this.purchasePlan }>
						{ this.translate( 'Purchase Now' ) }
					</Button>
				</CompactCard>

				<PlanStatusProgress plan={ plan } />
			</div>
		);
	}
} );

export default PlanStatus;
