/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getFlowType } from 'state/jetpack-connect/selectors';
import Main from 'components/main';
import ConnectHeader from './connect-header';
import observe from 'lib/mixins/data-observe';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import * as upgradesActions from 'lib/upgrades/actions';
import { userCan } from 'lib/site/utils';
import { isCalypsoStartedConnection } from 'state/jetpack-connect/selectors';
import { selectPlanInAdvance, goBackToWpAdmin } from 'state/jetpack-connect/actions';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { requestPlans } from 'state/plans/actions';
import { isRequestingPlans, getPlanBySlug } from 'state/plans/selectors';

const CALYPSO_REDIRECTION_PAGE = '/posts/';

const Plans = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	propTypes: {
		cart: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		sitePlans: React.PropTypes.object.isRequired,
		showJetpackFreePlan: React.PropTypes.bool,
		intervalType: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			intervalType: 'yearly'
		};
	},

	getInitialState: function getInitialState() {
		return {
			redirecting: false
		};
	},

	componentDidMount() {
		if ( this.hasPreSelectedPlan() ) {
			this.autoselectPlan();
		} else {
			this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
				user: this.props.userId,
				before_connection: !! this.props.showFirst
			} );
		}
		this.props.requestPlans( this.props.sitePlans );
	},

	componentWillReceiveProps( props ) {
		if ( ! props.sites ) {
			return;
		}
		if ( this.hasPlan( this.props.selectedSite ) ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + this.props.selectedSite.slug );
			this.setState( { redirect: true } );
		}
		if ( ! props.canPurchasePlans ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + this.props.selectedSite.slug );
			this.setState( { redirecting: true } );
		}

		if ( ! this.props.isRequestingPlans && ( this.props.flowType === 'pro' || this.props.flowType === 'premium' ) ) {
			return this.autoselectPlan();
		}
	},

	hasPreSelectedPlan() {
		return (
			this.props.flowType === 'pro' ||
			this.props.flowType === 'premium' ||
			( ! this.props.showFirst && this.props.jetpackConnectSelectedPlans[ this.props.selectedSite.slug ] )
		);
	},

	hasPlan( site ) {
		return site &&
			site.plan &&
			( site.plan.product_slug === 'jetpack_business' || site.plan.product_slug === 'jetpack_premium' );
	},

	autoselectPlan() {
		const selectedSiteSlug = this.props.selectedSite ? this.props.selectedSite.slug : this.props.siteSlug;
		if ( ! this.props.showFirst ) {
			if ( this.props.flowType === 'pro' ||
				this.props.jetpackConnectSelectedPlans[ selectedSiteSlug ] === 'jetpack_business' ) {
				this.props.requestPlans();
				const plan = this.props.getPlanBySlug( 'jetpack_business' );
				if ( plan ) {
					return this.selectPlan( plan );
				}
			}
			if ( this.props.flowType === 'premium' ||
				this.props.jetpackConnectSelectedPlans[ selectedSiteSlug ] === 'jetpack_premium'
			) {
				this.props.requestPlans();
				const plan = this.props.getPlanBySlug( 'jetpack_premium' );
				if ( plan ) {
					return this.selectPlan( plan );
				}
			}
			if ( this.props.jetpackConnectSelectedPlans[ selectedSiteSlug ] === 'free' ||
				this.props.jetpackConnectSelectedPlans[ selectedSiteSlug ] === 'jetpack_free' ) {
				this.selectFreeJetpackPlan();
			}
		}
	},

	selectFreeJetpackPlan() {
		// clears whatever we had stored in local cache
		this.props.selectPlanInAdvance( null, this.props.selectedSite.slug );
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId
		} );
		if ( isCalypsoStartedConnection( this.props.jetpackConnectSessions, this.props.selectedSite.slug ) ) {
			page.redirect( CALYPSO_REDIRECTION_PAGE + this.props.selectedSite.slug );
			this.setState( { redirecting: true } );
		} else {
			const { queryObject } = this.props.jetpackConnectAuthorize;
			this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
			this.setState( { redirecting: true } );
		}
	},

	selectPlan( cartItem ) {
		const checkoutPath = `/checkout/${ this.props.selectedSite.slug }`;
		// clears whatever we had stored in local cache
		this.props.selectPlanInAdvance( null, this.props.selectedSite.slug );

		if ( cartItem.product_slug === 'jetpack_free' ) {
			return this.selectFreeJetpackPlan();
		}
		if ( cartItem.product_slug === 'jetpack_premium' ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_99', {
				user: this.props.userId
			} );
		}
		if ( cartItem.product_slug === 'jetpack_business' ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_299', {
				user: this.props.userId
			} );
		}
		upgradesActions.addItem( cartItem );
		this.setState( { redirecting: true } );

		page( checkoutPath );
	},

	storeSelectedPlan( cartItem ) {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			user: this.props.userId,
			plan: cartItem ? cartItem.product_slug : 'free'
		} );
		this.props.selectPlanInAdvance( ( cartItem ? cartItem.product_slug : 'free' ), this.props.siteSlug );
	},

	renderConnectHeader() {
		const headerText = this.props.showFirst
			? this.translate( 'You are moments away from connecting your site' )
			: this.translate( 'Your site is now connected!' );
		return (
			<ConnectHeader
				showLogo={ false }
				headerText={ headerText }
				subHeaderText={ this.translate( 'Now pick a plan that\'s right for you' ) }
				step={ 1 }
				steps={ 3 } />
		);
	},

	render() {
		if ( this.state.redirecting || this.hasPreSelectedPlan() ) {
			return null;
		}
		if ( ! this.props.showFirst &&
			( ! this.props.canPurchasePlans || this.hasPlan( this.props.selectedSite ) )
		) {
			return null;
		}

		const defaultJetpackSite = { jetpack: true, plan: {}, isUpgradeable: () => true };
		return (
			<div>
				<Main wideLayout>
					<QueryPlans />
					{ this.props.selectedSite
						? <QuerySitePlans siteId={ this.props.selectedSite.ID } />
						: null
					}
					<div id="plans" className="jetpack-connect__plans-list plans has-sidebar">
						{ this.renderConnectHeader() }

						<div id="plans">
							<PlansFeaturesMain
								site={ this.props.selectedSite || defaultJetpackSite }
								isInSignup={ true }
								isInJetpackConnect={ true }
								onUpgradeClick={ this.props.showFirst ? this.storeSelectedPlan : this.selectPlan }
								intervalType="yearly"
								onSelectPlan={ this.props.showFirst ? this.storeSelectedPlan : this.selectPlan }
								onSelectFreeJetpackPlan={ this.props.showFirst ? this.storeSelectedPlan : this.selectFreeJetpackPlan }
								/>
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
		const selectedSite = props.sites ? props.sites.getSelectedSite() : null;

		const searchPlanBySlug = ( planSlug ) => {
			return getPlanBySlug( state, planSlug );
		};

		return {
			sitePlans: getPlansBySite( state, selectedSite ),
			jetpackConnectSessions: state.jetpackConnect.jetpackConnectSessions,
			jetpackConnectAuthorize: state.jetpackConnect.jetpackConnectAuthorize,
			jetpackConnectSelectedPlans: state.jetpackConnect.jetpackConnectSelectedPlans,
			userId: user ? user.ID : null,
			canPurchasePlans: userCan( 'manage_options', selectedSite ),
			flowType: getFlowType( state.jetpackConnect.jetpackConnectSessions, selectedSite ),
			isRequestingPlans: isRequestingPlans( state ),
			getPlanBySlug: searchPlanBySlug,
			selectedSite: selectedSite
		};
	},
	( dispatch ) => {
		return Object.assign( {},
			bindActionCreators( { goBackToWpAdmin, requestPlans, selectPlanInAdvance }, dispatch ),
			{
				recordTracksEvent( eventName, props ) {
					dispatch( recordTracksEvent( eventName, props ) );
				}
			}
		);
	}
)( Plans );
