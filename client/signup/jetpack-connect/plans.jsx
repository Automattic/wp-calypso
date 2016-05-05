/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import ConnectHeader from './connect-header';
import observe from 'lib/mixins/data-observe';
import PlanList from 'components/plans/plan-list' ;
import { shouldFetchSitePlans } from 'lib/plans';

const CALYPSO_REDIRECTION_PAGE = '/posts/';
const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // 1 Hour

const Plans = React.createClass( {
	mixins: [ observe( 'sites', 'plans' ) ],

	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		plans: React.PropTypes.object.isRequired,
		fetchSitePlans: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		showJetpackFreePlan: React.PropTypes.bool
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

	selectFreeJetpackPlan() {
		const selectedSite = this.props.sites.getSelectedSite();
		if ( this.isCalypsoStartedConnection( selectedSite.slug ) ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + selectedSite.slug );
		}
	},

	isCalypsoStartedConnection( siteSlug ) {
		const site = siteSlug.replace( /.*?:\/\//g, '' );
		if ( this.props.jetpackConnectSessions && this.props.jetpackConnectSessions[ site ] ) {
			const currentTime = ( new Date() ).getTime();
			return ( currentTime - this.props.jetpackConnectSessions[ site ] < JETPACK_CONNECT_TTL );
		}

		return false;
	},

	render() {
		const selectedSite = this.props.sites.getSelectedSite();

		return (
			<div>
				<Main>
					<div className="jetpack-connect__plans">
						<ConnectHeader headerText={ this.translate( 'Your site is now connected!' ) }
							subHeaderText={ this.translate( 'Now pick a plan that\'s right for you' ) }
							step={ 1 }
							steps={ 3 } />

						<div id="plans" className="plans has-sidebar">
							<PlanList
								isInSignup={ true }
								site={ selectedSite }
								plans={ this.props.plans.get() }
								sitePlans={ this.props.sitePlans }
								onOpen={ this.openPlan }
								cart={ this.props.cart }
								showJetpackFreePlan={ true }
								isSubmitting={ false }
								onSelectFreeJetpackPlan={ this.selectFreeJetpackPlan }/>
						</div>
					</div>
				</Main>
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() ),
			jetpackConnectSessions: state.jetpackConnect.jetpackConnectSessions
		};
	},
	( dispatch ) => {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( Plans );
