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
import { isCalypsoStartedConnection, getFlowType } from 'state/jetpack-connect/selectors';
import Main from 'components/main';
import ConnectHeader from './connect-header';
import observe from 'lib/mixins/data-observe';
import PlanList from 'components/plans/plan-list' ;
import plansFactory from 'lib/plans-list';
import { shouldFetchSitePlans } from 'lib/plans';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import * as upgradesActions from 'lib/upgrades/actions';
import { userCan } from 'lib/site/utils';
import { cartItems } from 'lib/cart-values';

const plans = plansFactory();

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

	componentWillUnmount: function() {
		plans.off( 'change', this.autoselectPlan );
	},

	componentDidMount() {
		plans.on( 'change', this.autoselectPlan );

		if ( this.props.flowType === 'pro' || this.props.flowType === 'premium' ) {
			return this.autoselectPlan();
		}

		this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
			user: this.props.userId
		} );
		this.updateSitePlans( this.props.sitePlans );
	},

	autoselectPlan() {
		if ( this.props.flowType === 'pro' ) {
			plans.get();
			const plan = plans.getPlanBySlug( 'jetpack_business' );
			if ( plan ) {
				this.selectPlan( cartItems.getItemForPlan( plan ) );
				return;
			}
		}
		if ( this.props.flowType === 'premium' ) {
			plans.get();
			const plan = plans.getPlanBySlug( 'jetpack_premium' );
			if ( plan ) {
				this.selectPlan( cartItems.getItemForPlan( plan ) );
				return;
			}
		}
	},

	componentWillReceiveProps( props ) {
		const selectedSite = props.sites.getSelectedSite();
		if ( this.hasPlan( selectedSite ) ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + selectedSite.slug );
		}
		if ( ! props.canPurchasePlans ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + selectedSite.slug );
		}
	},

	updateSitePlans( sitePlans ) {
		const selectedSite = this.props.sites.getSelectedSite();
		this.props.fetchSitePlans( sitePlans, selectedSite );
	},

	selectFreeJetpackPlan() {
		const selectedSite = this.props.sites.getSelectedSite();
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId
		} );
		if ( isCalypsoStartedConnection( this.props.jetpackConnectSessions, selectedSite.slug ) ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + selectedSite.slug );
		}
	},

	hasPlan( site ) {
		return site &&
			site.plan &&
			( site.plan.product_slug === 'jetpack_business' || site.plan.product_slug === 'jetpack_premium' );
	},

	selectPlan( cartItem ) {
		const selectedSite = this.props.sites.getSelectedSite();
		const checkoutPath = `/checkout/${ selectedSite.slug }`;
		if ( cartItem.product_slug === 'jetpack_premium' ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_99', {
				user: this.props.userId
			} );
			upgradesActions.addItem( cartItem );
			page( checkoutPath );
		}
		if ( cartItem.product_slug === 'jetpack_business' ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_299', {
				user: this.props.userId
			} );
			upgradesActions.addItem( cartItem );
			page( checkoutPath );
		}
	},

	render() {
		if ( this.props.flowType === 'pro' || this.props.flowType === 'premium' ) {
			return null;
		}

		const selectedSite = this.props.sites.getSelectedSite();

		if ( ! this.props.canPurchasePlans || this.hasPlan( selectedSite ) ) {
			return null;
		}

		return (
			<div>
				<Main>
					<div className="jetpack-connect__plans">
						<ConnectHeader
							showLogo={ false }
							headerText={ this.translate( 'Your site is now connected!' ) }
							subHeaderText={ this.translate( 'Now pick a plan that\'s right for you' ) }
							step={ 1 }
							steps={ 3 } />

						<div id="plans" className="plans has-sidebar">
							<PlanList
								isInSignup={ true }
								site={ selectedSite }
								plans={ plans.get() }
								sitePlans={ this.props.sitePlans }
								cart={ this.props.cart }
								showJetpackFreePlan={ true }
								isSubmitting={ false }
								onSelectPlan={ this.selectPlan }
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
		const user = getCurrentUser( state );
		const selectedSite = props.sites.getSelectedSite();
		return {
			sitePlans: getPlansBySite( state, selectedSite ),
			jetpackConnectSessions: state.jetpackConnect.jetpackConnectSessions,
			userId: user ? user.ID : null,
			canPurchasePlans: userCan( 'manage_options', selectedSite ),
			flowType: getFlowType( state.jetpackConnect.jetpackConnectSessions, selectedSite )
		};
	},
	( dispatch ) => {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			},
			recordTracksEvent( eventName, props ) {
				dispatch( recordTracksEvent( eventName, props ) );
			}
		};
	}
)( Plans );
