/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	find = require( 'lodash/collection/find' );

/**
 * Internal dependencies
 */
var abtest = require( 'lib/abtest' ).abtest,
	analytics = require( 'analytics' ),
	testFeatures = require( 'lib/features-list/test-features' ),
	Gridicon = require( 'components/gridicon' ),
	isJetpackPlan = require( 'lib/products-values' ).isJetpackPlan,
	JetpackPlanDetails = require( 'my-sites/plans/jetpack-plan-details' ),
	PlanActions = require( 'components/plans/plan-actions' ),
	PlanHeader = require( 'components/plans/plan-header' ),
	PlanPrice = require( 'components/plans/plan-price' ),
	PlanDiscountMessage = require( 'components/plans/plan-discount-message' ),
	Card = require( 'components/card' ),
	WpcomPlanDetails = require( 'my-sites/plans/wpcom-plan-details' );

module.exports = React.createClass( {
	displayName: 'Plan',

	handleLearnMoreClick: function() {
		window.scrollTo( 0, 0 );
		this.recordLearnMoreClick();
	},

	recordLearnMoreClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Learn More Link', 'Product ID', this.props.plan.product_id );

		if ( this.props.isInSignup ) {
			analytics.tracks.recordEvent( 'calypso_signup_compare_plans_click', {
				location: 'Learn more link',
				product_slug: this.props.plan.product_slug
			} );
		}
	},

	getDescription: function() {
		var comparePlansUrl, siteSuffix;
		const { plan, site } = this.props;

		if ( this.isPlaceholder() ) {
			return (
				<div>
					<p></p>

					<p></p>
				</div>
			);
		}

		siteSuffix = site ? site.slug : '';
		comparePlansUrl = this.props.comparePlansUrl ? this.props.comparePlansUrl : '/plans/compare/' + siteSuffix;

		if ( site && site.jetpack ) {
			return (
				<JetpackPlanDetails plan={ plan } />
			);
		}

		return (
			<WpcomPlanDetails
				comparePlansUrl={ comparePlansUrl }
				handleLearnMoreClick={ this.handleLearnMoreClick }
				plan={ plan } />
		);
	},

	getFeatureList: function() {
		var features;

		if ( this.isPlaceholder() ) {
			return;
		}

		features = testFeatures[ this.props.plan.product_slug ].map( function( feature, i ) {
			var classes = classNames( 'plan__feature', {
				'is-plan-specific': feature.planSpecific
			} );

			return (
				<li className={ classes } key={ i }>
					<Gridicon icon="checkmark" size={ 12 } />
					{ feature.text }
				</li>
			);
		} );

		return <ul className="plan__features">{ features }</ul>;
	},

	showDetails: function() {
		if ( 'function' === typeof ( this.props.onOpen ) ) {
			this.props.onOpen( this.props.plan.product_id );
		}
	},

	selectedSiteHasPlan: function() {
		return this.props.site && this.props.site.plan.product_id === this.props.plan.product_id;
	},

	isPlaceholder: function() {
		return this.props.placeholder;
	},

	getProductSlug: function() {
		if ( this.isPlaceholder() ) {
			return;
		}

		return this.props.plan.product_slug;
	},

	getClassNames: function() {
		var classObject = {
			plan: true,
			'is-active': this.props.open,
			'is-current-plan': this.selectedSiteHasPlan()
		};

		if ( this.isPlaceholder() ) {
			classObject[ 'is-placeholder' ] = true;
		} else {
			classObject[ this.props.plan.product_slug ] = true;
		}

		return classNames( classObject );
	},

	getSitePlan: function() {
		if ( this.isPlaceholder() || ! this.props.site ) {
			return;
		}

		return find( this.props.sitePlans.data, { productSlug: this.getProductSlug() } );
	},

	getPlanDiscountMessage: function() {
		if ( this.isPlaceholder() || this.props.hideDiscountMessage ) {
			return;
		}

		return (
			<PlanDiscountMessage
				plan={ this.props.plan }
				sitePlan={ this.getSitePlan() }
				site={ this.props.site }
				showMostPopularMessage={ true }/>
		);
	},

	getBadge: function() {
		if ( this.props.site && ! this.props.site.jetpack ) {
			if ( this.props.site.plan.product_slug === this.getProductSlug() ) {
				return (
					<Gridicon icon="checkmark-circle" />
				);
			}
		}
	},

	getProductName: function() {
		if ( this.isPlaceholder() ) {
			return;
		}

		return this.props.plan.product_name_short;
	},

	getPlanTagline: function() {
		if ( this.isPlaceholder() ) {
			return;
		}

		return this.props.plan.tagline;
	},

	getPlanPrice: function() {
		var isAllMySites = ! this.props.site && ! this.props.isInSignup;
		if ( isAllMySites ) {
			return;
		}

		return (
			<PlanPrice
				plan={ this.props.plan }
				isPlaceholder={ this.isPlaceholder() }
				isInSignup={ this.props.isInSignup }
				sitePlan={ this.getSitePlan() }
				site={ this.props.site } />
		);
	},

	getPlanActions: function() {
		return (
			<PlanActions
				plan={ this.props.plan }
				isInSignup={ this.props.isInSignup }
				onSelectPlan={ this.props.onSelectPlan }
				sitePlan={ this.getSitePlan() }
				site={ this.props.site }
				cart={ this.props.cart }
				enableFreeTrials={ this.props.enableFreeTrials }
				isPlaceholder={ this.isPlaceholder() }/>
		);
	},

	getImagePlanAction: function() {
		return (
			<PlanActions
				plan={ this.props.plan }
				isInSignup={ this.props.isInSignup }
				onSelectPlan={ this.props.onSelectPlan }
				sitePlan={ this.getSitePlan() }
				site={ this.props.site }
				cart={ this.props.cart }
				enableFreeTrials={ this.props.enableFreeTrials }
				isPlaceholder={ this.isPlaceholder() }
				isImageButton />
		);
	},

	render: function() {
		var shouldDisplayFeatureList = this.props.plan && ! isJetpackPlan( this.props.plan ) && abtest( 'plansFeatureList' ) === 'list';
		return (
			<Card className={ this.getClassNames() } key={ this.getProductSlug() } onClick={ this.showDetails }>
				{ this.getPlanDiscountMessage() }
				<PlanHeader onClick={ this.showDetails } text={ this.getProductName() } isPlaceholder={ this.isPlaceholder() }>
					{ this.getBadge() }

					<p className="plan__plan-tagline">{ this.getPlanTagline() }</p>

					{ this.getImagePlanAction() }
					{ this.getPlanPrice() }
				</PlanHeader>
				<div className="plan__plan-expand">
					<div className="plan__plan-details">
						{ shouldDisplayFeatureList ? this.getFeatureList() : this.getDescription() }
					</div>
					{ this.getPlanActions() }
				</div>
			</Card>
		);
	}
} );
