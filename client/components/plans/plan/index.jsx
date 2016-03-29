/**
 * External dependencies
 */
import classNames from 'classnames';
import find from 'lodash/find';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import JetpackPlanDetails from 'my-sites/plans/jetpack-plan-details';
import PlanActions from 'components/plans/plan-actions';
import PlanDiscountMessage from 'components/plans/plan-discount-message';
import PlanHeader from 'components/plans/plan-header';
import PlanPrice from 'components/plans/plan-price';
import WpcomPlanDetails from 'my-sites/plans/wpcom-plan-details' ;

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

	getComparePlansUrl: function() {
		var site = this.props.site,
			siteSuffix = site ? site.slug : '';

		return this.props.comparePlansUrl ? this.props.comparePlansUrl : '/plans/compare/' + siteSuffix;
	},

	getDescription: function() {
		const { plan, site } = this.props;

		if ( this.isPlaceholder() ) {
			return (
				<div>
					<p></p>

					<p></p>
				</div>
			);
		}

		if ( site && site.jetpack ) {
			return (
				<JetpackPlanDetails plan={ plan } />
			);
		}

		return (
			<WpcomPlanDetails
				comparePlansUrl={ this.getComparePlansUrl() }
				handleLearnMoreClick={ this.handleLearnMoreClick }
				plan={ plan } />
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
				showMostPopularMessage={ true } />
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
				isPlaceholder={ this.isPlaceholder() }
				isSubmitting={ this.props.isSubmitting } />
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
				isPlaceholder={ this.isPlaceholder() }
				isSubmitting={ this.props.isSubmitting }
				isImageButton />
		);
	},

	render: function() {
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
						{ this.getDescription() }
					</div>
					{ this.getPlanActions() }
				</div>
			</Card>
		);
	}
} );
