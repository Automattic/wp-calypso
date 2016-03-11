/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	connect = require( 'react-redux' ).connect,
	page = require( 'page' );

/**
 * Internal dependencies
 */
var abtest = require( 'lib/abtest' ).abtest,
	analytics = require( 'analytics' ),
	cartValues = require( 'lib/cart-values' ),
	cartItems = cartValues.cartItems,
	config = require( 'config' ),
	productsValues = require( 'lib/products-values' ),
	isFreePlan = productsValues.isFreePlan,
	isBusiness = productsValues.isBusiness,
	isEnterprise = productsValues.isEnterprise,
	plansPaths = require( 'my-sites/plans/paths' ),
	puchasesPaths = require( 'me/purchases/paths' ),
	refreshSitePlans = require( 'state/sites/plans/actions' ).refreshSitePlans,
	upgradesActions = require( 'lib/upgrades/actions' ),
	upgradesNotices = require( 'lib/upgrades/notices' );

var PlanActions = React.createClass( {
	propTypes: { plan: React.PropTypes.object },

	getButtons: function() {
		if ( this.props.isImageButton ) {
			return this.getImageButton();
		}

		if ( this.props.isInSignup ) {
			return this.shouldOfferFreeTrial() ? this.freeTrialActions() : this.upgradeActions();
		}

		if ( ! this.props.sitePlan ) {
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
					disabled={ this.props.isSubmitting }
					onClick={ this.handleSelectPlan }>
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
					disabled={ this.props.isSubmitting }
					onClick={ this.handleSelectPlan }>
					{ label }
				</button>
			</div>
		);
	},

	recordStartFreeTrialClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Start Free Trial Button', 'Product ID', this.props.plan.product_id );
	},

	recordUpgradeNowClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Upgrade Now Link', 'Product ID', this.props.plan.product_id );
	},

	recordUpgradeNowButton: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Upgrade Now Button', 'Product ID', this.props.plan.product_id );
	},

	getCartItem: function( properties ) {
		return cartItems.getItemForPlan( this.props.plan, properties );
	},

	handleSelectPlan: function( event ) {
		event.preventDefault();

		if ( this.props.isSubmitting ) {
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

		upgradesActions.addItem( cartItem );

		page( '/checkout/' + this.props.site.slug );
	},

	handleClickStartTrial: function( event ) {
		event.preventDefault();

		if ( this.props.isSubmitting ) {
			return;
		}

		this.recordStartFreeTrialClick();

		if ( this.props.onSelectPlan ) {
			return this.props.onSelectPlan( this.getCartItem( { isFreeTrial: true } ) );
		}

		upgradesNotices.displaySubmitting( { isFreeCart: true } );

		upgradesActions.startFreeTrial( this.props.site.ID, this.props.plan, function( error ) {
			if ( error ) {
				upgradesNotices.displayError( error );
				return;
			}

			upgradesNotices.clear();

			this.props.refreshSitePlans( this.props.site.ID );

			page( plansPaths.plansDestination( this.props.site.slug, 'thank-you' ) );
		}.bind( this ) );
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
		if ( isFreePlan( this.props.plan ) ) {
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

		if ( this.shouldOfferFreeTrial() ) {
			return (
				<div onClick={ this.handleClickStartTrial } className={ classes } />
			);
		}

		return (
			<div onClick={ this.handleSelectPlan } className={ classes } />
		);
	},

	freeTrialActions: function() {
		if ( isFreePlan( this.props.plan ) ) {
			return this.freePlanButton();
		}

		return (
			<div>
				<button className="button is-primary plan-actions__upgrade-button"
					disabled={ this.props.isSubmitting }
					onClick={ this.handleClickStartTrial }>
						{ this.translate( 'Start Free Trial', { context: 'Store action' } ) }
				</button>

				<small className="plan-actions__trial-period">
					{ config.isEnabled( 'upgrades/checkout' )
						? this.translate( 'Try it free for 14 days, no credit card needed, or {{a}}upgrade now{{/a}}.', {
							context: 'Store action',
							components: {
								a: <a href="#" onClick={ this.handleSelectPlan } />
							}
						} )
						: this.translate( 'Try it free for 14 days, no credit card needed.' )
					}
				</small>
			</div>
		);
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

module.exports = connect(
	undefined,
	function mapDispatchToProps( dispatch ) {
		return {
			refreshSitePlans: function( siteId ) {
				dispatch( refreshSitePlans( siteId ) );
			}
		};
	}
)( PlanActions );
