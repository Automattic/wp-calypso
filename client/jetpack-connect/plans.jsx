/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { mc } from 'lib/analytics';
import { PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY } from 'lib/plans/constants';
import { addItem } from 'lib/upgrades/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { selectPlanInAdvance, goBackToWpAdmin, completeFlow } from 'state/jetpack-connect/actions';
import { getFlowType, isRedirectingToWpAdmin, getSiteSelectedPlan, getGlobalSelectedPlan, getAuthorizationData, isCalypsoStartedConnection } from 'state/jetpack-connect/selectors';
import { isRequestingPlans, getPlanBySlug } from 'state/plans/selectors';
import { canCurrentUser } from 'state/selectors';
import { isSiteAutomatedTransfer } from 'state/selectors';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';

const CALYPSO_REDIRECTION_PAGE = '/posts/';
const CALYPSO_PLANS_PAGE = '/plans/my-plan/';
const JETPACK_ADMIN_PATH = '/wp-admin/admin.php?page=jetpack';

class Plans extends Component {
	constructor() {
		super();
		this.selectPlan = this.selectPlan.bind( this );
		this.storeSelectedPlan = this.storeSelectedPlan.bind( this );
		this.redirecting = false;
	}

	static propTypes = {
		sitePlans: PropTypes.object.isRequired,
		showJetpackFreePlan: PropTypes.bool,
	};

	static defaultProps = {
		siteSlug: '*',
	};

	componentDidMount() {
		if ( this.props.isAutomatedTransfer && ! this.redirecting && this.props.selectedSite ) {
			this.redirecting = true;
			this.props.goBackToWpAdmin( this.props.selectedSite.URL + JETPACK_ADMIN_PATH );
		} else if ( this.hasPreSelectedPlan() ) {
			this.autoselectPlan();
		} else {
			this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
				user: this.props.userId,
			} );
		}
	}

	componentDidUpdate() {
		if ( this.props.isAutomatedTransfer && ! this.redirecting && this.props.selectedSite ) {
			this.redirecting = true;
			this.props.goBackToWpAdmin( this.props.selectedSite.URL + JETPACK_ADMIN_PATH );
		}

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

		if ( ! this.props.isRequestingPlans && this.isFlowTypePaid() && ! this.redirecting ) {
			return this.autoselectPlan();
		}
	}

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.selectFreeJetpackPlan();
	};

	isFlowTypePaid() {
		return (
			this.props.flowType === 'pro' ||
			this.props.flowType === 'premium' ||
			this.props.flowType === 'personal'
		);
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
		this.props.completeFlow();
	}

	redirect( path ) {
		page.redirect( path + this.props.selectedSiteSlug );
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
		return (
			site &&
			site.plan &&
			( site.plan.product_slug === PLAN_JETPACK_BUSINESS ||
				site.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY ||
				site.plan.product_slug === PLAN_JETPACK_PREMIUM ||
				site.plan.product_slug === PLAN_JETPACK_PREMIUM_MONTHLY ||
				site.plan.product_slug === PLAN_JETPACK_PERSONAL ||
				site.plan.product_slug === PLAN_JETPACK_PERSONAL_MONTHLY )
		);
	}

	autoselectPlan() {
		if ( ! this.props.showFirst ) {
			if (
				this.props.flowType === 'personal' ||
				this.props.selectedPlan === PLAN_JETPACK_PERSONAL
			) {
				const plan = this.props.getPlanBySlug( PLAN_JETPACK_PERSONAL );
				if ( plan ) {
					this.selectPlan( plan );
					return;
				}
			}
			if ( this.props.selectedPlan === PLAN_JETPACK_PERSONAL_MONTHLY ) {
				const plan = this.props.getPlanBySlug( PLAN_JETPACK_PERSONAL_MONTHLY );
				if ( plan ) {
					this.selectPlan( plan );
					return;
				}
			}
			if ( this.props.flowType === 'pro' || this.props.selectedPlan === PLAN_JETPACK_BUSINESS ) {
				const plan = this.props.getPlanBySlug( PLAN_JETPACK_BUSINESS );
				if ( plan ) {
					this.selectPlan( plan );
					return;
				}
			}
			if ( this.props.selectedPlan === PLAN_JETPACK_BUSINESS_MONTHLY ) {
				const plan = this.props.getPlanBySlug( PLAN_JETPACK_BUSINESS_MONTHLY );
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
			if (
				this.props.flowType === 'premium' ||
				this.props.selectedPlan === PLAN_JETPACK_PREMIUM_MONTHLY
			) {
				const plan = this.props.getPlanBySlug( PLAN_JETPACK_PREMIUM_MONTHLY );
				if ( plan ) {
					this.selectPlan( plan );
					return;
				}
			}
			if ( this.props.selectedPlan === 'free' || this.props.selectedPlan === PLAN_JETPACK_FREE ) {
				this.selectFreeJetpackPlan();
			}
		}
	}

	selectFreeJetpackPlan() {
		// clears whatever we had stored in local cache
		this.props.selectPlanInAdvance( null, this.props.selectedSiteSlug );
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId,
		} );
		mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_free' );

		if ( this.props.calypsoStartedConnection ) {
			this.redirect( CALYPSO_REDIRECTION_PAGE );
		} else {
			this.redirectToWpAdmin();
		}
	}

	selectPlan( cartItem ) {
		const checkoutPath = `/checkout/${ this.props.selectedSite.slug }`;
		// clears whatever we had stored in local cache
		this.props.selectPlanInAdvance( null, this.props.selectedSiteSlug );

		if ( ! cartItem || cartItem.product_slug === PLAN_JETPACK_FREE ) {
			return this.selectFreeJetpackPlan();
		}

		if ( cartItem.product_slug === get( this.props, 'selectedSite.plan.product_slug', null ) ) {
			return this.redirect( CALYPSO_PLANS_PAGE );
		}

		if ( cartItem.product_slug === PLAN_JETPACK_PERSONAL ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_personal', {
				user: this.props.userId,
			} );
			mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_personal' );
		}
		if ( cartItem.product_slug === PLAN_JETPACK_PERSONAL_MONTHLY ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_personal_monthly', {
				user: this.props.userId,
			} );
			mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_personal_monthly' );
		}
		if ( cartItem.product_slug === PLAN_JETPACK_PREMIUM ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_premium', {
				user: this.props.userId,
			} );
			mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_premium' );
		}
		if ( cartItem.product_slug === PLAN_JETPACK_PREMIUM_MONTHLY ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_premium_monthly', {
				user: this.props.userId,
			} );
			mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_premium_monthly' );
		}
		if ( cartItem.product_slug === PLAN_JETPACK_BUSINESS ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_business', {
				user: this.props.userId,
			} );
			mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_business' );
		}
		if ( cartItem.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_submit_business_monthly', {
				user: this.props.userId,
			} );
			mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_business_monthly' );
		}
		addItem( cartItem );
		this.redirecting = true;
		this.props.completeFlow();
		page.redirect( checkoutPath );
	}

	storeSelectedPlan( cartItem ) {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			user: this.props.userId,
			plan: cartItem ? cartItem.product_slug : 'free',
		} );
		this.props.selectPlanInAdvance(
			cartItem ? cartItem.product_slug : 'free',
			this.props.siteSlug
		);
	}

	render() {
		if (
			this.redirecting ||
			this.hasPreSelectedPlan() ||
			( ! this.props.showFirst && ! this.props.canPurchasePlans ) ||
			( ! this.props.showFirst && this.hasPlan( this.props.selectedSite ) )
		) {
			return <QueryPlans />;
		}

		return (
			<div>
				<QueryPlans />
				{ this.props.selectedSite ? (
					<QuerySitePlans siteId={ this.props.selectedSite.ID } />
				) : null }
				<PlansGrid
					{ ...this.props }
					basePlansPath={
						this.props.showFirst ? '/jetpack/connect/authorize' : '/jetpack/connect/plans'
					}
					onSelect={
						this.props.showFirst || this.props.isLanding ? this.storeSelectedPlan : this.selectPlan
					}
					hideFreePlan={ true }
				>
					<PlansSkipButton onClick={ this.handleSkipButtonClick } />
				</PlansGrid>
			</div>
		);
	}
}

export default connect(
	state => {
		const user = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );
		const selectedSiteSlug = selectedSite ? selectedSite.slug : '*';

		const selectedPlan =
			getSiteSelectedPlan( state, selectedSiteSlug ) || getGlobalSelectedPlan( state );
		const searchPlanBySlug = planSlug => {
			return getPlanBySlug( state, planSlug );
		};

		return {
			selectedSite,
			selectedSiteSlug,
			selectedPlan,
			isAutomatedTransfer: selectedSite ? isSiteAutomatedTransfer( state, selectedSite.ID ) : false,
			sitePlans: getPlansBySite( state, selectedSite ),
			jetpackConnectAuthorize: getAuthorizationData( state ),
			userId: user ? user.ID : null,
			canPurchasePlans: selectedSite
				? canCurrentUser( state, selectedSite.ID, 'manage_options' )
				: true,
			flowType: getFlowType( state, selectedSiteSlug ),
			isRequestingPlans: isRequestingPlans( state ),
			getPlanBySlug: searchPlanBySlug,
			calypsoStartedConnection: isCalypsoStartedConnection( state, selectedSiteSlug ),
			redirectingToWpAdmin: isRedirectingToWpAdmin( state ),
		};
	},
	{
		goBackToWpAdmin,
		completeFlow,
		selectPlanInAdvance,
		recordTracksEvent,
	}
)( localize( Plans ) );
