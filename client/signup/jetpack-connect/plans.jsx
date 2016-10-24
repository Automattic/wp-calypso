/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlansGrid from './plans-grid';
import { PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS } from 'lib/plans/constants';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import * as upgradesActions from 'lib/upgrades/actions';
import { selectPlanInAdvance, goBackToWpAdmin, completeFlow } from 'state/jetpack-connect/actions';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { isRequestingPlans, getPlanBySlug } from 'state/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { canCurrentUser } from 'state/current-user/selectors';
import {
	getFlowType,
	isRedirectingToWpAdmin,
	getSiteSelectedPlan,
	getGlobalSelectedPlan,
	getAuthorizationData,
	isCalypsoStartedConnection
} from 'state/jetpack-connect/selectors';

const CALYPSO_REDIRECTION_PAGE = '/posts/';
const CALYPSO_PLANS_PAGE = '/plans/my-plan/';
const JETPACK_ADMIN_PATH = '/wp-admin/admin.php?page=jetpack';

class Plans extends Component {
	constructor() {
		super();
		this.selectPlan = this.selectPlan.bind( this );
		this.redirecting = false;
	}

	static propTypes = {
		cart: PropTypes.object.isRequired,
		context: PropTypes.object.isRequired,
		destinationType: PropTypes.string,
		sitePlans: PropTypes.object.isRequired,
		showJetpackFreePlan: PropTypes.bool,
		intervalType: PropTypes.string
	};

	static defaultProps = {
		intervalType: 'yearly',
		siteSlug: '*'
	};

	componentDidMount() {
		if ( this.hasPreSelectedPlan() ) {
			this.autoselectPlan();
		} else {
			this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
				user: this.props.userId
			} );
		}
	}

	componentDidUpdate() {
		if ( this.hasPlan( this.props.selectedSite ) && ! this.redirecting ) {
			this.redirect( CALYPSO_PLANS_PAGE );
		}
		if ( ! this.props.canPurchasePlans && ! this.redirecting ) {
			if ( this.props.isCalypsoStartedConnection ) {
				this.redirect( CALYPSO_REDIRECTION_PAGE );
			} else {
				this.redirectToWpAdmin();
			}
		}

		if ( ! this.props.isRequestingPlans &&
				this.isFlowTypePaid() &&
				! this.redirecting ) {
			return this.autoselectPlan();
		}
	}

	isFlowTypePaid()  {
		return  this.props.flowType === 'pro' || this.props.flowType === 'premium' || this.props.flowType === 'personal';
	}

	redirectToWpAdmin() {
		if ( this.props.redirectingToWpAdmin ) {
			return;
		}

		const { queryObject } = this.props.jetpackConnectAuthorize;
		if ( queryObject ) {
			this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		} else if ( this.props.selectedSite ) {
			this.props.goBackToWpAdmin( this.props.selectedSite.URL + JETPACK_ADMIN_PATH );
		}
	}

	redirect( path ) {
		page.redirect( path + this.props.selectedSite.slug );
		this.redirecting = true;
		this.props.completeFlow();
	}

	hasPreSelectedPlan() {
		if ( this.isFlowTypePaid() ) {
			return true;
		}

		return !! this.props.selectedPlan;
	}

	hasPlan( site ) {
		return site &&
			site.plan &&
			( site.plan.product_slug === PLAN_JETPACK_BUSINESS || site.plan.product_slug === PLAN_JETPACK_PREMIUM );
	}

	autoselectPlan() {
		if ( ! this.props.showFirst ) {
			if ( this.props.flowType === 'pro' || this.props.selectedPlan === PLAN_JETPACK_BUSINESS ) {
				const plan = this.props.getPlanBySlug( PLAN_JETPACK_BUSINESS );
				if ( plan ) {
					this.selectPlan( plan );
					return;
				}
			}
			if ( this.props.flowType === 'premium' || this.props.selectedPlan === PLAN_JETPACK_PREMIUM ) {
				const plan = this.props.getPlanBySlug( PLAN_JETPACK_PREMIUM );
				if ( plan ) {
					this.selectPlan( plan );
					return;
				}
			}
			if ( this.props.selectedPlan === 'free' ||
				this.props.selectedPlan === PLAN_JETPACK_FREE ) {
				this.selectFreeJetpackPlan();
			}
		}
	}

	selectFreeJetpackPlan() {
		// clears whatever we had stored in local cache
		this.props.selectPlanInAdvance( null, this.props.selectedSite.slug );
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId
		} );
		if ( this.props.calypsoStartedConnection ) {
			this.redirect( CALYPSO_REDIRECTION_PAGE );
		} else {
			this.redirectToWpAdmin();
		}
	}

	selectPlan( cartItem ) {
		const checkoutPath = `/checkout/${ this.props.selectedSite.slug }`;
		// clears whatever we had stored in local cache
		this.props.selectPlanInAdvance( null, this.props.selectedSite.slug );

		if ( cartItem.product_slug === PLAN_JETPACK_FREE ) {
			return this.selectFreeJetpackPlan();
		}
		if ( cartItem.product_slug === PLAN_JETPACK_PREMIUM ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_99', {
				user: this.props.userId
			} );
		}
		if ( cartItem.product_slug === PLAN_JETPACK_BUSINESS ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_299', {
				user: this.props.userId
			} );
		}
		upgradesActions.addItem( cartItem );
		this.redirecting = true;
		this.props.completeFlow();
		page( checkoutPath );
	}

	storeSelectedPlan( cartItem ) {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			user: this.props.userId,
			plan: cartItem ? cartItem.product_slug : 'free'
		} );
		this.props.selectPlanInAdvance(
			cartItem ? cartItem.product_slug : 'free',
			this.props.siteSlug,
		);
	}

	render() {
		if ( this.redirecting ||
			this.hasPreSelectedPlan() ||
			( ! this.props.showFirst && ! this.props.canPurchasePlans ) ||
			( ! this.props.showFirst && this.hasPlan( this.props.selectedSite ) )
		) {
			return null;
		}

		return (
			<div>
				<QueryPlans />
				{ this.props.selectedSite
					? <QuerySitePlans siteId={ this.props.selectedSite.ID } />
					: null
				}
				<PlansGrid
					{ ...this.props }
					onSelect={ this.props.showFirst || this.props.isLanding ? this.storeSelectedPlan : this.selectPlan } />
			</div>
		);
	}
}

export default connect(
	state => {
		const user = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );
		const selectedSiteSlug = selectedSite ? selectedSite.slug : null;

		const selectedPlan = getSiteSelectedPlan( state, selectedSiteSlug ) || getGlobalSelectedPlan( state );
		const searchPlanBySlug = ( planSlug ) => {
			return getPlanBySlug( state, planSlug );
		};

		return {
			selectedSite,
			selectedPlan,
			sitePlans: getPlansBySite( state, selectedSite ),
			jetpackConnectAuthorize: getAuthorizationData( state ),
			userId: user ? user.ID : null,
			canPurchasePlans: canCurrentUser( state, selectedSite.ID, 'manage_options' ),
			flowType: getFlowType( state, selectedSite && selectedSite.slug ),
			isRequestingPlans: isRequestingPlans( state ),
			getPlanBySlug: searchPlanBySlug,
			calypsoStartedConnection: isCalypsoStartedConnection( state, selectedSite.slug ),
			redirectingToWpAdmin: isRedirectingToWpAdmin( state ),
		};
	},
	{
		goBackToWpAdmin,
		completeFlow,
		selectPlanInAdvance,
		recordTracksEvent
	}
)( localize( Plans ) );
