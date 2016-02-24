/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	connect = require( 'react-redux' ).connect,
	page = require( 'page' ),
	property = require( 'lodash/property' ),
	times = require( 'lodash/times' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	getABTestVariation = require( 'lib/abtest' ).getABTestVariation,
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	Gridicon = require( 'components/gridicon' ),
	PlanActions = require( 'components/plans/plan-actions' ),
	PlanHeader = require( 'components/plans/plan-header' ),
	PlanPrice = require( 'components/plans/plan-price' ),
	analytics = require( 'analytics' ),
	HeaderCake = require( 'components/header-cake' ),
	isFreePlan = require( 'lib/products-values' ).isFreePlan,
	isBusiness = require( 'lib/products-values' ).isBusiness,
	isPremium = require( 'lib/products-values' ).isPremium,
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	getPlansBySite = require( 'state/sites/plans/selectors' ).getPlansBySite,
	Card = require( 'components/card' ),
	featuresListUtils = require( 'lib/features-list/utils' ),
	filterPlansBySiteAndProps = require( 'lib/plans' ).filterPlansBySiteAndProps,
	NavItem = require( 'components/section-nav/item' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	SectionNav = require( 'components/section-nav' ),
	shouldFetchSitePlans = require( 'lib/plans' ).shouldFetchSitePlans;

var PlansCompare = React.createClass( {
	displayName: 'PlansCompare',

	mixins: [
		observe( 'features', 'plans' )
	],

	componentWillReceiveProps: function( nextProps ) {
		this.props.fetchSitePlans( nextProps.sitePlans, nextProps.selectedSite );
	},

	getInitialState: function() {
		return { selectedPlan: 'premium' }
	},

	getDefaultProps: function() {
		return {
			isInSignup: false
		};
	},

	componentDidMount: function() {
		analytics.tracks.recordEvent( 'calypso_plans_compare', {
			is_in_signup: this.props.isInSignup
		} );

		if ( ! this.props.isInSignup ) {
			this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
		}
	},

	recordViewAllPlansClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked View All Plans' );
	},

	goBack: function() {
		var selectedSite = this.props.selectedSite,
			plansLink = '/plans';

		if ( this.props.backUrl ) {
			return page( this.props.backUrl );
		}

		if ( selectedSite ) {
			plansLink += '/' + selectedSite.slug;
		}

		this.recordViewAllPlansClick();
		page( plansLink );
	},

	showFreeTrialException: function() {
		const hasTrial = this.props.selectedSite
				? this.props.selectedSite.plan.free_trial
				: false,
			canStartTrial = this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer
				? this.props.sitePlans.data.some( property( 'canStartTrial' ) )
				: false;

		if ( getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			return false;
		}

		// always show if the user is currently in trial
		if ( hasTrial ) {
			return true;
		}

		// show if the site is eligible for a trial (it never had a free trial before)
		// and free trial is enabled for this component
		if ( canStartTrial && this.props.enableFreeTrials ) {
			return true;
		}

		// show if we are in signup and free trial is enabled for this component
		if ( this.props.isInSignup && this.props.enableFreeTrials ) {
			return true;
		}

		return false;
	},

	freeTrialExceptionMarker: function( feature ) {
		if ( this.showFreeTrialException() && featuresListUtils.featureNotPartOfTrial( feature ) ) {
			return '*';
		}

		return null;
	},

	freeTrialExceptionMessage: function() {
		if ( ! this.isDataLoading() &&
			this.showFreeTrialException() &&
			this.getFeatures().some( featuresListUtils.featureNotPartOfTrial ) ) {
			return (
				<div className="plans-compare__free-trial-exception-message">
					{ this.translate( '* Not included during the free trial period' ) }
				</div>
			);
		}

		return null;
	},

	isDataLoading: function() {
		if ( ! this.props.features.get() ) {
			return true;
		}

		if ( this.props.isInSignup ) {
			return false;
		}

		if ( ! this.props.selectedSite ) {
			return false;
		}

		if ( this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer ) {
			return false;
		}

		return true;
	},

	isSelected: function( plan ) {
		if ( this.state.selectedPlan === 'free' ) {
			return isFreePlan( plan );
		}

		if ( this.state.selectedPlan === 'premium' ) {
			return isPremium( plan );
		}

		if ( this.state.selectedPlan === 'business' ) {
			return isBusiness( plan );
		}
	},

	getFeatures: function() {
		var plans = this.getPlans();

		return this.props.features.get().filter( function( feature ) {
			return plans.some( function( plan ) {
				return feature[ plan.product_id ];
			} );
		} );
	},

	getPlans: function() {
		return filterPlansBySiteAndProps(
			this.props.plans.get(),
			this.props.selectedSite,
			this.props.hideFreePlan
		);
	},

	getSitePlan: function( plan ) {
		return this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer
			? find( this.props.sitePlans.data, { productSlug: plan.product_slug } )
			: undefined;
	},

	getTableHeader: function() {
		var plans, planElements;

		if ( this.isDataLoading() ) {
			planElements = times( 4, function( n ) {
				if ( n === 0 ) {
					return <th className="plans-compare__features" key={ n } />;
				}

				return (
					<th key={ n } className="plans-compare__header-cell">
						<div className="plans-compare__header-cell-placeholder" />
					</th>
				);
			} );
		} else {
			plans = this.getPlans();
			planElements = [ <th className="plans-compare__features" key="placeholder" /> ];

			planElements = planElements.concat( plans.map( function( plan ) {
				var sitePlan = this.getSitePlan( plan ),
					classes = classNames( 'plans-compare__header-cell', {
						'is-selected': this.isSelected( plan )
					} );
				return (
					<th className={ classes } key={ plan.product_slug }>
						<PlanHeader key={ plan.product_slug } text={ plan.product_name_short }>
							<PlanPrice
								plan={ plan }
								sitePlan={ sitePlan }
								site={ this.props.selectedSite } />
						</PlanHeader>
					</th>
				);
			}.bind( this ) ) );
		}

		return (
			<tr>{ planElements }</tr>
		);
	},

	getTableFeatureRows: function() {
		var plans, features, rows;

		if ( this.isDataLoading() ) {
			rows = times( 8, function( i ) {
				var cells = times( 4, function( n ) {
					var classes = classNames( 'plans-compare__cell-placeholder', {
						'is-plan-specific': n !== 0
					} );

					return (
						<td className="plans-compare__cell" key={ n }>
							<div className={ classes } />
						</td>
					);
				} );

				return (
					<tr className="plans-compare__row" key={ i }>{ cells }</tr>
				);
			} );
		} else {
			plans = this.getPlans();
			features = this.getFeatures();

			rows = features.map( function( feature ) {
				var planFeatures = plans.map( function( plan ) {
					var classes = classNames( 'plans-compare__cell', 'is-plan-specific', {
							'is-selected': this.isSelected( plan )
						} ),
						content;

					if ( typeof feature[ plan.product_id ] === 'boolean' && feature[ plan.product_id ] ) {
						content = <Gridicon icon="checkmark-circle" size={ 24 } />;
					}

					if ( typeof feature[ plan.product_id ] === 'string' ) {
						content = feature[ plan.product_id ];
					}

					return (
						<td
							className={ classes }
							key={ plan.product_id }>
							<div className="plans-compare__feature-title-mobile">
								{ feature.title }
							</div>
							<div className="plans-compare__cell-content">
								{ content }
							</div>
						</td>
					);
				}.bind( this ) );

				return (
					<tr className="plans-compare__row" key={ feature.title }>
						<td
							className="plans-compare__cell"
							key={ feature.title }>
							{ feature.title }
							{ this.freeTrialExceptionMarker( feature ) }
						</td>
						{ planFeatures }
					</tr>
				);
			}.bind( this ) );
		}

		return rows;
	},

	getTableActionRow: function() {
		var plans, cells;

		if ( this.isDataLoading() ) {
			return null;
		}

		plans = this.getPlans();
		cells = [ <td className="plans-compare__action-cell" key="placeholder" /> ];

		cells = cells.concat( plans.map( function( plan ) {
			var sitePlan = this.getSitePlan( plan ),
				classes = classNames( 'plans-compare__action-cell', {
					'is-selected': this.isSelected( plan )
				} );

			return (
				<td className={ classes } key={ plan.product_id }>
					<PlanActions
						enableFreeTrials={ this.props.enableFreeTrials }
						onSelectPlan={ this.props.onSelectPlan }
						isInSignup={ this.props.isInSignup }
						plan={ plan }
						site={ this.props.selectedSite }
						sitePlan={ sitePlan }
						cart={ this.props.cart } />
				</td>
			);
		}.bind( this ) ) );

		return (
			<tr>{ cells }</tr>
		);
	},

	comparisonTable: function() {
		return (
			<table className="plans-compare__table">
				<thead>
					{ this.getTableHeader() }
				</thead>
				<tbody>
					{ this.getTableFeatureRows() }
					{ this.getTableActionRow() }
				</tbody>
			</table>
		);
	},

	setPlan: function( name ) {
		this.setState( { selectedPlan: name } );
	},

	sectionNavigationForMobile() {
		return (
			<span className="plans-compare__section-navigation">
				<SectionNav>
					<NavTabs>
						<NavItem onClick={ this.setPlan.bind( this, 'free' ) }>
							{ this.translate( 'Free' ) }
						</NavItem>
						<NavItem onClick={ this.setPlan.bind( this, 'premium' ) }>
							{ this.translate( 'Premium' ) }
						</NavItem>
						<NavItem onClick={ this.setPlan.bind( this, 'business' ) }>
							{ this.translate( 'Business' ) }
						</NavItem>
					</NavTabs>
				</SectionNav>
			</span>
		);
	},

	render: function() {
		var compareString = this.translate( 'Compare Plans' );

		if ( this.props.selectedSite && this.props.selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		return (
			<div className={ this.props.className }>
				{
					this.props.isInSignup
					? null
					: <SidebarNavigation />
				}
				<HeaderCake onClick={ this.goBack }>
					{ compareString }
				</HeaderCake>
				{ this.sectionNavigationForMobile() }
				<Card>
					{ this.comparisonTable() }
					{ this.freeTrialExceptionMessage() }
				</Card>
			</div>
		);
	}
} );

module.exports = connect(
	function mapStateToProps( state, props ) {
		return {
			sitePlans: getPlansBySite( state, props.selectedSite )
		};
	},
	function mapDispatchToProps( dispatch ) {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( PlansCompare );
