/**
 * External dependencies
 */
var React = require( 'react' ),
	times = require( 'lodash/times' );

/**
 * Internal dependencies
 */
var Plan = require( 'components/plans/plan' ),
	Card = require( 'components/card' ),
	abtest = require( 'lib/abtest' ).abtest,
	isJpphpBundle = require( 'lib/products-values' ).isJpphpBundle,
	filterPlansBySiteAndProps = require( 'lib/plans' ).filterPlansBySiteAndProps,
	getCurrentPlan = require( 'lib/plans' ).getCurrentPlan,
	config = require( 'config' ),
	ComparisonTable = require( 'components/comparison-table' ),
	ComparisonColumn = require( 'components/comparison-table/comparison-column' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'PlanList',

	getInitialState: function() {
		return { openPlan: '' };
	},

	openPlan: function( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	getMockFeatures: function() {
		return {
			domain: {
				description: 'Your own domain',
				free: null,
				personal: '1 Year Free',
				pro: '1 Year Free',
				business: '1 Year Free'
			},
			advertising: {
				description: 'Advertising vouchers',
				free: false,
				personal: false,
				pro: '$150 value',
				business: '$300 value'
			},
			google: {
				description: 'Google Apps',
				free: false,
				personal: false,
				pro: 'Email only',
				business: 'All services'
			},
			prioritySupport: {
				description: 'Priority Support',
				free: false,
				personal: false,
				pro: false,
				business: '24/7 live chat'
			},
			design: {
				header: true,
				description: 'Design'
			},
			themes: {
				description: '150+ High quality themes',
				free: true,
				personal: true,
				pro: true,
				business: true
			},
			customization: {
				description: 'Standard Customization',
				free: true,
				personal: true,
				pro: true,
				business: true
			},
			premiumThemes: {
				description: 'Free premium themes',
				free: false,
				personal: false,
				pro: true,
				business: true
			},
			advancedCustomization: {
				description: 'Advanced Customization',
				free: false,
				personal: false,
				pro: true,
				business: true
			},
			designReviewService: {
				description: 'Design Review Service',
				free: false,
				personal: false,
				pro: false,
				business: true
			},
			storageUploads: {
				header: true,
				description: 'Storage & Uploads'
			},
			storageSpace: {
				description: 'Storage Space',
				free: '500 Mb',
				personal: '1 Gb',
				pro: '5 Gb',
				business: 'Unlimited'
			},

		}
	},

	render: function() {
		var className = '',
			plans = this.props.plans,
			isLoadingSitePlans = ! this.props.isInSignup && ! this.props.sitePlans.hasLoadedFromServer,
			numberOfPlaceholders = 3,
			site = this.props.site,
			plansList,
			currentPlan;

		if ( this.props.hideFreePlan || ( site && site.jetpack ) ) {
			numberOfPlaceholders = 2;
			className = 'jetpack';
		}

		if ( plans.length === 0 || isLoadingSitePlans ) {
			plansList = times( numberOfPlaceholders, function( n ) {
				return (
					<Plan
						className={ className }
						placeholder={ true }
						isInSignup={ this.props.isInSignup }
						key={ `plan-${ n }` } />
				);
			}.bind( this ) );

			return (
				<div className="plan-list">{ plansList }</div>
			);
		}

		if ( ! this.props.isInSignup ) {
			// check if this site was registered via the JPPHP "Jetpack Start" program
			// if so, we want to display a message that this plan is managed via the hosting partner
			currentPlan = getCurrentPlan( this.props.sitePlans.data );
			if ( isJpphpBundle( currentPlan ) ) {
				return (
					<Card>
						<p>
							{
								this.translate( 'This plan is managed by your web host. ' +
									'Please log into your host\'s control panel to manage subscription ' +
									'and billing information.' )
							}
						</p>
					</Card>
				);
			}
		}

		if ( plans.length > 0 ) {
			plans = filterPlansBySiteAndProps( plans, site, this.props.hideFreePlan );

			plansList = plans.map( function( plan ) {
				return (
					<Plan
						plan={ plan }
						sitePlans={ this.props.sitePlans }
						comparePlansUrl={ this.props.comparePlansUrl }
						hideDiscountMessage={ this.props.hideFreePlan }
						isInSignup={ this.props.isInSignup }
						key={ plan.product_id }
						open={ plan.product_id === this.state.openPlan }
						onOpen={ this.openPlan }
						onSelectPlan={ this.props.onSelectPlan }
						site={ site }
						cart={ this.props.cart }
						isSubmitting={ this.props.isSubmitting } />
				);
			}, this );
		}

		let aaMarkup;
		if ( abtest( 'plansPageBusinessAATest' ) === 'originalA' ) {
			aaMarkup = plansList;
		} else {
			aaMarkup = plansList;
		}

		if( ! config.isEnabled( 'jetpack/calypso-first-signup-flow' ) )
			return <div className="plan-list">{ aaMarkup }</div>;
		else {
			return (
				<ComparisonTable
					featuresList={ this.getMockFeatures() }
					columns={ 4 }>

					<ComparisonColumn
						featuresList={ this.getMockFeatures() }
						descriptionColumn={ true }
						>
						<div>
							<Gridicon icon="wordpress" size={ 24 } />
							<h2>{ this.translate( 'Yearly Savings Plans' ) }</h2>
							<p>{ this.translate( 'Plans are billed annually and have a 30-day money back guarantee' ) }</p>
						</div>

					</ComparisonColumn>

					<ComparisonColumn
						featuresList={ this.getMockFeatures() }
						comparisonID="free"
						name={ this.translate( 'Free' ) }
						description={ this.translate( 'Just Getting Started' ) }
						price={ 0 }
						currentPlan={ true }
						></ComparisonColumn>

					<ComparisonColumn
						featuresList={ this.getMockFeatures() }
						comparisonID="personal"
						name={ this.translate( 'Personal' ) }
						description={ this.translate( 'Just getting started' ) }
						price={ 5.99 }
						></ComparisonColumn>

					<ComparisonColumn
						featuresList={ this.getMockFeatures() }
						comparisonID="pro"
						name={ this.translate( 'Pro' ) }
						description={ this.translate( 'Just getting started' ) }
						price={ 12.99 }
						popular={ true }
						></ComparisonColumn>

					<ComparisonColumn
						featuresList={ this.getMockFeatures() }
						comparisonID="business"
						name={ this.translate( 'Business' ) }
						description={ this.translate( 'Just getting started' ) }
						price={ 24.99 }
						></ComparisonColumn>

				</ComparisonTable>
			);
		}
	}
} );
