/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { isCalypsoStartedConnection } from 'state/jetpack-connect/selectors';
import Main from 'components/main';
import ConnectHeader from './connect-header';
import observe from 'lib/mixins/data-observe';
import PlanList from 'components/plans/plan-list' ;
import { shouldFetchSitePlans } from 'lib/plans';

const CALYPSO_REDIRECTION_PAGE = '/posts/';

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

	componentDidMount() {
		this.updateSitePlans( this.props.sitePlans );
	},

	updateSitePlans( sitePlans ) {
		const selectedSite = this.props.sites.getSelectedSite();

		this.props.fetchSitePlans( sitePlans, selectedSite );
	},

	selectFreeJetpackPlan() {
		const selectedSite = this.props.sites.getSelectedSite();
		if ( isCalypsoStartedConnection( this.props.jetpackConnectSessions, selectedSite.slug ) ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + selectedSite.slug );
		}
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
