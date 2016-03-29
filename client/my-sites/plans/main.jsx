/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getCurrentPlan } from 'lib/plans';
import { getPlansBySite } from 'state/sites/plans/selectors';
import Gridicon from 'components/gridicon';
import { isJpphpBundle } from 'lib/products-values';
import Main from 'components/main';
import Notice from 'components/notice';
import observe from 'lib/mixins/data-observe';
import paths from './paths';
import PlanList from 'components/plans/plan-list' ;
import PlanOverview from './plan-overview';
import { shouldFetchSitePlans } from 'lib/plans';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { SUBMITTING_WPCOM_REQUEST } from 'lib/store-transactions/step-types';
import UpgradesNavigation from 'my-sites/upgrades/navigation';

const Plans = React.createClass( {
	displayName: 'Plans',

	mixins: [ observe( 'sites', 'plans' ) ],

	getInitialState: function() {
		return { openPlan: '' };
	},

	componentDidMount: function() {
		this.updateSitePlans( this.props.sitePlans );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.updateSitePlans( nextProps.sitePlans );
	},

	updateSitePlans: function( sitePlans ) {
		const selectedSite = this.props.sites.getSelectedSite();

		this.props.fetchSitePlans( sitePlans, selectedSite );
	},

	openPlan: function( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	recordComparePlansClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Compare Plans Link' );
	},

	comparePlansLink: function() {
		const selectedSite = this.props.sites.getSelectedSite();
		var url = '/plans/compare';

		var compareString = this.translate( 'Compare Plans' );

		if ( selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		if ( this.props.plans.get().length <= 0 ) {
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

	render: function() {
		const selectedSite = this.props.sites.getSelectedSite(); 
		var hasJpphpBundle,
			currentPlan;

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

		return (
			<div>
				{ this.renderNotice() }

				<Main>
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						<PlanList
							site={ selectedSite }
							plans={ this.props.plans.get() }
							sitePlans={ this.props.sitePlans }
							onOpen={ this.openPlan }
							onSelectPlan={ this.props.onSelectPlan }
							cart={ this.props.cart }
							isSubmitting={ this.props.transaction.step.name === SUBMITTING_WPCOM_REQUEST } />
						{ ! hasJpphpBundle && this.comparePlansLink() }
					</div>
				</Main>
			</div>
		);
	}
} );

export default connect(
	function mapStateToProps( state, props ) {
		return {
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() )
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
)( Plans );
