/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var abtest = require( 'lib/abtest' ).abtest,
	analytics = require( 'analytics' ),
	config = require( 'config' ),
	productsValues = require( 'lib/products-values' ),
	isFreePlan = productsValues.isFreePlan,
	isBusiness = productsValues.isBusiness,
	isEnterprise = productsValues.isEnterprise,
	getABTestVariation = require( 'lib/abtest' ).getABTestVariation,
	cartItems = require( 'lib/cart-values' ).cartItems,
	puchasesPaths = require( 'me/purchases/paths' );

module.exports = React.createClass( {
	displayName: 'PlanActions',

	propTypes: { plan: React.PropTypes.object },

	getButtons: function() {
		if ( this.props.isImageButton ) {
			return this.getImageButton();
		}

		if ( this.props.isInSignup ) {
			return this.shouldOfferFreeTrial() ? this.freeTrialActions() : this.upgradeActions();
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

	getInternalButtons: function() {
		if ( ! this.props.cart.hasLoadedFromServer || ! this.props.site ) {
			return null;
		}

		return this.shouldOfferFreeTrial() ? this.freeTrialActions() : this.upgradeActions();
	},

	freePlanButton: function() {
		return (
			<div>
				<button className="button is-primary plan-actions__upgrade-button"
					onClick={ this.handleAddToCart.bind( null, null, 'button' ) }>
					{ this.translate( 'Select Free Plan' ) }
				</button>
			</div>
		);
	},

	upgradeActions: function() {
		var label;

		if ( isFreePlan( this.props.plan ) ) {
			return this.freePlanButton();
		}

		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		if ( this.props.sitePlan && this.props.sitePlan.freeTrial ) {
			label = this.translate( 'Purchase Now' );
		} else {
			label = this.translate( 'Upgrade Now' );
		}

		return (
			<div>
				<button
					className="button is-primary plan-actions__upgrade-button"
					onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: false } ), 'button' ) }>
					{ label }
				</button>
			</div>
		);
	},

	recordStartFreeTrialClick: function( cartItem ) {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Start Free Trial Button', 'Product ID', cartItem.product_id );
	},

	recordUpgradeNowClick: function( cartItem ) {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Upgrade Now Link', 'Product ID', cartItem.product_id );
	},

	recordUpgradeNowButton: function( cartItem ) {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Upgrade Now Button', 'Product ID', cartItem.product_id );
	},

	recordUpgradeTrialNowClick: function( cartItem ) {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Upgrade Now Link For Trial', 'Product ID', cartItem.product_id );
	},

	handleAddToCart: function( cartItem, actionType, event ) {
		if ( event ) {
			event.preventDefault();
		}

		if ( cartItem && actionType ) {
			if ( actionType === 'button' ) {
				if ( cartItem.free_trial ) {
					this.recordStartFreeTrialClick( cartItem );
				}
				if ( ! cartItem.free_trial ) {
					this.recordUpgradeNowButton( cartItem );
				}
			}

			if ( actionType === 'link' ) {
				if ( cartItem.free_trial ) {
					this.recordUpgradeTrialNowClick( cartItem );
				}
				if ( ! cartItem.free_trial ) {
					this.recordUpgradeNowClick( cartItem );
				}
			}
		}

		if ( this.props.onSelectPlan ) {
			this.props.onSelectPlan( cartItem );
		}
	},

	canSelectPlan: function() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return false;
		}

		if ( this.props.site ) {
			if ( this.siteHasThisPlan() ) {
				return false;
			}

			if ( this.planHasCost() && ! isBusiness( this.props.site.plan ) ) {
				return true;
			}
			return false;
		}
		return true;
	},

	shouldOfferFreeTrial: function() {
		if ( getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			return false;
		}

		if ( ! this.props.enableFreeTrials ) {
			return false;
		}

		const siteCanOfferTrial = this.props.sitePlan && this.props.sitePlan.canStartTrial;

		if ( ! this.props.isInSignup && ! siteCanOfferTrial ) {
			return false;
		}

		return true;
	},

	getImageButton: function() {
		const classes = classNames( 'plan-actions__illustration', this.props.plan.product_slug );

		if ( ! this.canSelectPlan( this.props.plan ) ) {
			return (
				<div className={ classes } />
			);
		}

		if ( isFreePlan( this.props.plan ) ) {
			return (
				<div onClick={ this.handleAddToCart.bind( null, null, 'button' ) } className={ classes } />
			);
		}

		return (
			<div onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: this.shouldOfferFreeTrial() } ), 'button' ) } className={ classes } />
		);
	},

	freeTrialActions: function() {
		if ( isFreePlan( this.props.plan ) ) {
			return this.freePlanButton();
		}

		return (
			<div>
				<button className="button is-primary plan-actions__upgrade-button"
					onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: true } ), 'button' ) }>
						{ this.translate( 'Start Free Trial', { context: 'Store action' } ) }
				</button>

				<small className="plan-actions__trial-period">
					{ config.isEnabled( 'upgrades/checkout' )
						? this.translate( 'Try it free for 14 days, no credit card needed, or {{a}}upgrade now{{/a}}.', {
							context: 'Store action',
							components: {
								a: <a href="#"
									onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: false } ), 'link' ) } />
							}
						} )
						: this.translate( 'Try it free for 14 days, no credit card needed.' )
					}
				</small>
			</div>
		);
	},

	cartItem: function( properties ) {
		return cartItems.getItemForPlan( this.props.plan, properties );
	},

	downgradeMessage: function() {
		return (
			<small className="plan-actions__trial-period">{ this.translate( 'Contact support to downgrade your plan.' ) }</small>
		);
	},

	siteHasThisPlan: function() {
		return ! this.props.isInSignup && this.props.site && this.props.site.plan.product_id === this.props.plan.product_id;
	},

	managePlanButton: function() {
		var link;
		if ( this.planHasCost() ) {
			link = puchasesPaths.managePurchase( this.props.site.slug, this.props.sitePlan.id );
			return (
				<a href={ link } className="button plan-actions__upgrade-button">{ this.translate( 'Manage Plan', { context: 'Link to current plan from /plans/' } ) }</a>
			);
		}
	},

	freePlanExpiration: function() {
		if ( ! this.planHasCost() && abtest( 'plansFeatureList' ) !== 'list' ) {
			return (
				<span className="plan-actions__plan-expiration">{ this.translate( 'Never expires', { context: 'Expiration info for free plan in /plans/' } ) }</span>
			);
		}
	},

	recordCurrentPlanClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Current Plan' );
	},

	getCurrentPlanHint: function() {
		if ( ! this.props.sitePlan ) {
			return;
		}

		return (
			<div>
				<span className="plan-actions__current-plan-label" onClick={ this.recordCurrentPlanClick }>
				{ this.translate( 'Your current plan', { context: 'Informing the user of their current plan on /plans/' } ) }</span>
				{ this.freePlanExpiration() }
			</div>
		);
	},

	planHasCost: function() {
		return this.props.plan.cost > 0;
	},

	placeholder: function() {
		return <span className="button plan-actions__upgrade-button" />;
	},

	getContent: function() {
		if ( this.props.isPlaceholder ) {
			return this.placeholder();
		}

		if ( ! this.props.isInSignup && this.props.site && isEnterprise( this.props.site.plan ) ) {
			return this.downgradeMessage();
		}

		return this.getButtons();
	},

	render: function() {
		var classes = classNames( {
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
