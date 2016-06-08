/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import analytics from 'lib/analytics';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getCurrentPlan } from 'lib/plans';
import { getPlans } from 'state/plans/selectors';
import Gridicon from 'components/gridicon';
import { isJpphpBundle } from 'lib/products-values';
import Main from 'components/main';
import Notice from 'components/notice';
import observe from 'lib/mixins/data-observe';
import paths from './paths';
import PlanList from 'components/plans/plan-list' ;
import PlanListRedesign from 'components/plans-redesign/plan-list';
import PlanOverview from './plan-overview';
import { shouldFetchSitePlans } from 'lib/plans';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { SUBMITTING_WPCOM_REQUEST } from 'lib/store-transactions/step-types';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import QueryPlans from 'components/data/query-plans';

const Plans = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		plans: React.PropTypes.array.isRequired,
		fetchSitePlans: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		transaction: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return { openPlan: '' };
	},

	componentDidMount() {
		this.updateSitePlans( this.props.sitePlans );
	},

	componentWillReceiveProps( nextProps ) {
		this.updateSitePlans( nextProps.sitePlans );
	},

	updateSitePlans( sitePlans ) {
		const selectedSite = this.props.sites.getSelectedSite();

		this.props.fetchSitePlans( sitePlans, selectedSite );
	},

	openPlan( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	recordComparePlansClick() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Compare Plans Link' );
	},

	comparePlansLink() {
		const selectedSite = this.props.sites.getSelectedSite();
		let url = '/plans/compare',
			compareString = this.translate( 'Compare Plans' );

		if ( selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		if ( this.props.plans.length <= 0 ) {
			return '';
		}

		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}

		return (
			<a href={ url } className="compare-plans-link" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ compareString }
			</a>
		);
	},

	redirectToDefault() {
		page.redirect( paths.plans( this.props.sites.getSelectedSite().slug ) );
	},

	renderNotice() {
		if ( 'free-trial-canceled' === this.props.destinationType ) {
			return (
				<Notice onDismissClick={ this.redirectToDefault } status="is-success">
					{ this.translate( 'Your trial has been removed. Thanks for giving it a try!' ) }
				</Notice>
			);
		}
	},

	render() {
		const plansRedesignEnabled = config.isEnabled( 'manage/plans/redesign' );
		const selectedSite = this.props.sites.getSelectedSite();
		let hasJpphpBundle,
			currentPlan,
			mainStyle;
		
		// Set which PlanList to use (either PlanList or PlanListRedesign).
		let List = PlanList;

		if ( this.props.sitePlans.hasLoadedFromServer ) {
			currentPlan = getCurrentPlan( this.props.sitePlans.data );
			hasJpphpBundle = isJpphpBundle( currentPlan );
		}

		if ( this.props.sitePlans.hasLoadedFromServer && currentPlan.freeTrial ) {
			return (
				<PlanOverview
					sitePlans={ this.props.sitePlans }
					path={ this.props.context.path }
					cart={ this.props.cart }
					destinationType={ this.props.context.params.destinationType }
					plan={ currentPlan }
					selectedSite={ selectedSite } />
			);
		}
		
		if ( plansRedesignEnabled ) {
			List = PlanListRedesign;
			mainStyle = { maxWidth: 1040 };
		}

		return (
			<div>
				{ this.renderNotice() }

				<Main style={ mainStyle }>
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						<QueryPlans />

						<List
							site={ selectedSite }
							plans={ this.props.plans }
							sitePlans={ this.props.sitePlans }
							onOpen={ this.openPlan }
							cart={ this.props.cart }
							isSubmitting={ this.props.transaction.step.name === SUBMITTING_WPCOM_REQUEST } />

						{ 
							! hasJpphpBundle &&
							! plansRedesignEnabled &&
							this.comparePlansLink()
						}
					</div>
				</Main>
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			plans: getPlans( state ),
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() )
		};
	},

	dispatch => {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( Plans );
