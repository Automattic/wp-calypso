/**
 * External dependencies
 */
import classNames from 'classnames';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';
import config from 'config';
import { isBusiness, isEnterprise, isFreePlan, isFreeJetpackPlan } from 'lib/products-values';
import purchasesPaths from 'me/purchases/paths';
import { isValidFeatureKey } from 'lib/plans';
import * as upgradesActions from 'lib/upgrades/actions';

const PlanActions = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object,
		selectedFeature: React.PropTypes.string
	},

	getButtons() {
		if ( this.props.isImageButton ) {
			return this.getImageButton();
		}

		if ( this.props.isInSignup ) {
			return this.upgradeActions();
		}

		if ( ! this.props.sitePlan ) {
			return null;
		}

		if ( this.props.site && ! this.props.site.isUpgradeable() ) {
			return null;
		}

		if ( this.siteHasThisPlan() ) {
			if ( this.props.sitePlan.freeTrial ) {
				return this.upgradeActions();
			}

			return (
				<div className="plan-actions__action-details">
					<div className="plan-actions__current">
						{ this.managePlanButton() }
						{ this.getCurrentPlanHint() }
					</div>
				</div>
			);
		}

		if ( this.canSelectPlan( this.props.plan ) ) {
			return this.getInternalButtons();
		}
	},

	getInternalButtons() {
		if ( ! this.props.cart.hasLoadedFromServer || ! this.props.site ) {
			return null;
		}

		return this.upgradeActions();
	},

	freePlanButton() {
		return (
			<div>
				<button className="button is-primary plan-actions__upgrade-button"
					disabled={ this.props.isSubmitting }
					onClick={ this.handleSelectPlan }>
					{ this.translate( 'Select Free' ) }
				</button>
			</div>
		);
	},

	freeJetpackPlanButton() {
		return (
			<div>
				<button className="button is-primary plan-actions__upgrade-button"
					disabled={ this.props.isSubmitting }
					onClick={ this.handleSelectJetpackFreePlan }>
					{ this.translate( 'Select Free' ) }
				</button>
			</div>
		);
	},

	upgradeActions() {
		if ( isFreePlan( this.props.plan ) ) {
			return this.freePlanButton();
		}

		if ( isFreeJetpackPlan( this.props.plan ) ) {
			return this.freeJetpackPlanButton();
		}

		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		let label = this.translate( 'Upgrade Now' );

		if ( this.props.sitePlan && this.props.sitePlan.freeTrial ) {
			label = this.translate( 'Purchase Now' );
		}

		return (
			<div>
				<button
					className="button is-primary plan-actions__upgrade-button"
					disabled={ this.props.isSubmitting }
					onClick={ this.handleSelectPlan }>
					{ label }
				</button>
			</div>
		);
	},

	recordUpgradeNowClick() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Upgrade Now Link', 'Product ID', this.props.plan.product_id );
	},

	recordUpgradeNowButton() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Upgrade Now Button', 'Product ID', this.props.plan.product_id );
	},

	getCartItem( properties ) {
		return cartItems.getItemForPlan( this.props.plan, properties );
	},

	handleSelectJetpackFreePlan( event ) {
		event.preventDefault();

		if ( this.props.onSelectFreeJetpackPlan ) {
			return this.props.onSelectFreeJetpackPlan();
		}
	},

	handleSelectPlan( event ) {
		event.preventDefault();

		if ( this.props.isSubmitting ) {
			return;
		}

		if ( this.props.site && ! this.props.site.isUpgradeable() ) {
			return;
		}

		const actionType = event.target.tagName === 'A' ? 'link' : 'button';

		if ( 'link' === actionType ) {
			this.recordUpgradeNowClick();
		} else {
			this.recordUpgradeNowButton();
		}

		const cartItem = isFreePlan( this.props.plan ) ? null : this.getCartItem();

		if ( this.props.onSelectPlan ) {
			return this.props.onSelectPlan( cartItem );
		}

		if ( ! cartItem ) {
			return;
		}

		upgradesActions.addItem( cartItem );

		const checkoutPath = this.props.selectedFeature && isValidFeatureKey( this.props.selectedFeature )
			? `/checkout/features/${this.props.selectedFeature}/${ this.props.site.slug }`
			: `/checkout/${ this.props.site.slug }`;

		page( checkoutPath );
	},

	canSelectPlan() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return false;
		}

		if ( this.props.site ) {
			if ( this.siteHasThisPlan() ) {
				return false;
			}

			return this.planHasCost() && ! isBusiness( this.props.site.plan );
		}

		return true;
	},

	getImageButton() {
		const classes = classNames( 'plan-actions__illustration', this.props.plan.product_slug );

		if ( ! this.canSelectPlan( this.props.plan ) ) {
			return (
				<div className={ classes } />
			);
		}

		return (
			<div onClick={ this.handleSelectPlan } className={ classes } />
		);
	},

	downgradeMessage() {
		return (
			<small className="plan-actions__trial-period">{ this.translate( 'Contact support to downgrade your plan.' ) }</small>
		);
	},

	siteHasThisPlan() {
		return ! this.props.isInSignup && this.props.site && this.props.site.plan.product_id === this.props.plan.product_id;
	},

	managePlanButton() {
		if ( this.planHasCost() && this.props.sitePlan.userIsOwner ) {
			const link = purchasesPaths.managePurchase( this.props.site.slug, this.props.sitePlan.id );

			return (
				<a href={ link } className="button plan-actions__upgrade-button">
					{ this.translate( 'Manage Plan', { context: 'Link to current plan from /plans/' } ) }
				</a>
			);
		}
	},

	freePlanExpiration() {
		if ( ! this.planHasCost() ) {
			return (
				<span className="plan-actions__plan-expiration">
					{ this.translate( 'Never expires', { context: 'Expiration info for free plan in /plans/' } ) }
				</span>
			);
		}
	},

	recordCurrentPlanClick() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Current Plan' );
	},

	getCurrentPlanHint() {
		return (
			<div>
				<span className="plan-actions__current-plan-label" onClick={ this.recordCurrentPlanClick }>
				{ this.translate( 'Your current plan', { context: 'Informing the user of their current plan on /plans/' } ) }</span>
				{ this.freePlanExpiration() }
			</div>
		);
	},

	planHasCost() {
		return this.props.plan.cost > 0;
	},

	placeholder() {
		return <span className="button plan-actions__upgrade-button" />;
	},

	getContent() {
		if ( this.props.isPlaceholder ) {
			return this.placeholder();
		}

		if (
			! this.props.isInSignup &&
			this.props.site &&
			isEnterprise( this.props.site.plan )
		) {
			return this.downgradeMessage();
		}

		return this.getButtons();
	},

	render() {
		const classes = classNames( {
			'plan-actions': true,
			'is-placeholder': this.props.isPlaceholder,
			'is-image-button': this.props.isImageButton
		} );

		return (
			<div className={ classes }>
				{ this.getContent() }
			</div>
		);
	}
} );

export default PlanActions;
