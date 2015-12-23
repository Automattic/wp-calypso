/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	find = require( 'lodash/collection/find' );

/**
 * Internal dependencies
 */
var PlanHeader = require( 'components/plans/plan-header' ),
	PlanFeatureCell = require( 'components/plans/plan-feature-cell' ),
	PlanActions = require( 'components/plans/plan-actions' ),
	PlanPrice = require( 'components/plans/plan-price' ),
	PlanDiscountMessage = require( 'components/plans/plan-discount-message' );

module.exports = React.createClass( {
	displayName: 'PlanFeatures',

	featureIncludedString: function( feature ) {
		var included = feature[ this.props.plan.product_id ];
		if ( 'boolean' === typeof included && included ) {
			return ( <span className="plan-features__included no-text"></span> );
		}
		if ( 'string' === typeof included ) {
			return ( <span className="plan-features__included">{ included }</span> );
		}
		return ( <span className="plan-features__not-included no-text" /> );
	},

	headerText: function() {
		return <span className="header-text">{ this.props.plan.product_name }</span>;
	},

	render: function() {
		var features, classes,
			sitePlan = this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer ?
				find( this.props.sitePlans.data, { productSlug: this.props.plan.product_slug } ) :
				undefined;

		features = this.props.features.map( function( feature ) {
			return (
				<PlanFeatureCell key={ feature.product_slug }>
					{ this.featureIncludedString( feature ) }
				</PlanFeatureCell>
			);
		}, this );

		classes = classNames( 'plan-feature-column', 'plan-features', this.props.plan.product_slug );

		return (
			<div key={ this.props.plan.product_id } className={ classes }>
				<PlanHeader text={ this.headerText() } />
				{ features }
				<PlanPrice
					plan={ this.props.plan }
					sitePlan={ sitePlan }
					site={ this.props.site } />
				<PlanActions
					onSelectPlan={ this.props.onSelectPlan }
					isInSignup={ this.props.isInSignup }
					plan={ this.props.plan }
					site={ this.props.site }
					sitePlan={ sitePlan }
					cart={ this.props.cart } />
				<PlanDiscountMessage
					plan={ this.props.plan }
					sitePlan={ sitePlan }
					site={ this.props.site } />
			</div>
		);
	}

} );
