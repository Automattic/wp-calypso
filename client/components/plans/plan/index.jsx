/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	Gridicon = require( 'components/gridicon' ),
	PlanActions = require( 'components/plans/plan-actions' ),
	PlanHeader = require( 'components/plans/plan-header' ),
	PlanPrice = require( 'components/plans/plan-price' ),
	PlanDiscountMessage = require( 'components/plans/plan-discount-message' ),
	Card = require( 'components/card' );

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

		if ( this.isPlaceholder() ) {
			return (
				<div>
					<p></p>

					<p></p>
				</div>
			);
		}

		siteSuffix = this.props.site ? this.props.site.slug : '';
		comparePlansUrl = this.props.comparePlansUrl ? this.props.comparePlansUrl : '/plans/compare/' + siteSuffix;

		return (
			<div>
				<p>{ this.props.plan.shortdesc }</p>
				<a href={ comparePlansUrl } onClick={ this.handleLearnMoreClick }
					className="plan__learn-more">{ this.translate( 'Learn more', { context: 'Find out more details about a plan' } ) }</a>
			</div>
		);
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

	getProductId: function() {
		if ( this.isPlaceholder() ) {
			return;
		}

		return this.props.plan.product_id;
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

	getSiteSpecificPlanDetails: function() {
		if ( this.isPlaceholder() || ! this.props.site ) {
			return;
		}

		return this.props.siteSpecificPlansDetailsList.get( this.props.site.domain, this.getProductId() );
	},

	getPlanDiscountMessage: function() {
		if ( this.isPlaceholder() ) {
			return;
		}

		return (
			<PlanDiscountMessage
				plan={ this.props.plan }
				siteSpecificPlansDetails={ this.getSiteSpecificPlanDetails() }
				site={ this.props.site }
				showMostPopularMessage={ true }/>
		);
	},

	getBadge: function() {
		if ( this.props.site ) {
			if ( this.props.site.plan.product_id === this.getProductId() ) {
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
				siteSpecificPlansDetails={ this.getSiteSpecificPlanDetails() }
				site={ this.props.site } />
		);
	},

	getPlanActions: function() {
		return (
			<PlanActions
				plan={ this.props.plan }
				isInSignup={ this.props.isInSignup }
				onSelectPlan={ this.props.onSelectPlan }
				siteSpecificPlansDetails={ this.getSiteSpecificPlanDetails() }
				site={ this.props.site }
				cart={ this.props.cart }
				isPlaceholder={ this.isPlaceholder() }/>
		);
	},

	getImagePlanAction: function() {
		return (
			<PlanActions
				plan={ this.props.plan }
				isInSignup={ this.props.isInSignup }
				onSelectPlan={ this.props.onSelectPlan }
				siteSpecificPlansDetails={ this.getSiteSpecificPlanDetails() }
				site={ this.props.site }
				cart={ this.props.cart }
				isPlaceholder={ this.isPlaceholder() }
				isImageButton />
		);
	},

	render: function() {
		return (
			<Card className={ this.getClassNames() } key={ this.getProductId() } onClick={ this.showDetails }>
				{ this.getPlanDiscountMessage() }
				<PlanHeader onClick={ this.showDetails } text={ this.getProductName() } isPlaceholder={ this.isPlaceholder() }>
					{ this.getBadge() }

					<p className="plan__plan-tagline">{ this.getPlanTagline() }</p>

					{ this.getImagePlanAction() }
					{ this.getPlanPrice() }
				</PlanHeader>
				<div className="plan__plan-expand">
					<div className="plan__plan-details">
						{ this.getDescription() }
					</div>
					{ this.getPlanActions() }
				</div>
			</Card>
		);
	}
} );
