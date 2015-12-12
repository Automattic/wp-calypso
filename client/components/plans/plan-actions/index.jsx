/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	productsValues = require( 'lib/products-values' ),
	config = require( 'config' ),
	isFreePlan = productsValues.isFreePlan,
	isBusiness = productsValues.isBusiness,
	isEnterprise = productsValues.isEnterprise,
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
			return config.isEnabled( 'upgrades/free-trials' ) ? this.newPlanActions() : this.upgradeActions();
		}

		if ( this.siteHasThisPlan() ) {
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

		const canStartTrial = config.isEnabled( 'upgrades/free-trials' ) ? this.props.siteSpecificPlansDetails.can_start_trial : false;

		return canStartTrial ? this.newPlanActions() : this.upgradeActions();
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
		return (
			<div>
				<button className="button is-primary plan-actions__upgrade-button"
					onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: false } ), 'button' ) }>
					{ this.translate( 'Upgrade Now' ) }
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
			<div onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: false } ), 'button' ) } className={ classes } />
		);
	},

	newPlanActions: function() {
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
					{ this.translate( 'Try it free for 14 days, no credit card needed, or {{a}}upgrade now{{/a}}.', {
						context: 'Store action',
						components: {
							a: <a href="#"
								onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: false } ), 'link' ) } />
						} } ) }
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
			link = puchasesPaths.managePurchase( this.props.site.slug, this.props.siteSpecificPlansDetails.id );
			return (
				<a href={ link } className="button plan-actions__upgrade-button">{ this.translate( 'Manage Plan', { context: 'Link to current plan from /plans/' } ) }</a>
			);
		}
	},

	freePlanExpiration: function() {
		if ( config.isEnabled( 'upgrades/free-trials' ) && ! this.planHasCost() ) {
			return (
				<span className="plan-actions__plan-expiration">{ this.translate( 'Never expires', { context: 'Expiration info for free plan in /plans/' } ) }</span>
			);
		}
	},

	recordCurrentPlanClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Current Plan' );
	},

	getTrialPlanHint: function() {
		var remainingDays = this.moment(
				this.props.siteSpecificPlansDetails.expiry
			).diff( this.moment(), 'days' ),
			translationComponents = {
				strong: <strong />,
				link: <a href='#'
					className="plan-actions__trial-upgrade-now"
					onClick={ this.handleAddToCart.bind( null, this.cartItem( { isFreeTrial: false } ), 'link' ) } />
			},
			hint;

		if ( remainingDays === 0 ) {
			hint = this.translate(
				'{{strong}}Your trial ends today.{{/strong}} Like what you see? {{link}}Upgrade Now{{/link}}',
				{ components: translationComponents }
			);
		} else {
			hint = this.translate(
				'{{strong}}Your trial ends in %(days)d day.{{/strong}} Like what you see? {{link}}Upgrade Now{{/link}}',
				'{{strong}}Your trial ends in %(days)d days.{{/strong}} Like what you see? {{link}}Upgrade Now{{/link}}',
				{
					args: { days: remainingDays },
					count: remainingDays,
					components: translationComponents
				}
			);
		}

		return (
			<div className="plan-actions__trial-hint">{ hint }</div>
		);
	},

	getCurrentPlanHint: function() {
		if ( ! this.props.siteSpecificPlansDetails ) {
			return;
		}

		if ( this.isPlanOnTrial() ) {
			return this.getTrialPlanHint();
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

	isPlanOnTrial: function() {
		return this.props.siteSpecificPlansDetails.free_trial;
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
