/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import {
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { addItem } from 'lib/upgrades/actions';
import { selectPlanInAdvance, goBackToWpAdmin, completeFlow } from 'state/jetpack-connect/actions';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { isRequestingPlans, getPlanBySlug } from 'state/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import {
	canCurrentUser,
	getJetpackConnectRedirectAfterAuth,
	isRtl,
	isSiteOnPaidPlan,
} from 'state/selectors';
import {
	getFlowType,
	isRedirectingToWpAdmin,
	getSiteSelectedPlan,
	getGlobalSelectedPlan,
	isCalypsoStartedConnection,
} from 'state/jetpack-connect/selectors';
import { mc } from 'lib/analytics';
import { isSiteAutomatedTransfer } from 'state/selectors';

const CALYPSO_REDIRECTION_PAGE = '/posts/';
const CALYPSO_PLANS_PAGE = '/plans/my-plan/';
const JETPACK_ADMIN_PATH = '/wp-admin/admin.php?page=jetpack';

class Plans extends Component {
	static propTypes = { showJetpackFreePlan: PropTypes.bool };

	static defaultProps = { siteSlug: '*' };

	redirecting = false;

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

		if ( this.props.hasPlan && ! this.redirecting ) {
			this.redirecting = true;
			this.redirect( CALYPSO_PLANS_PAGE );
		}
		if ( ! this.props.canPurchasePlans && ! this.redirecting ) {
			this.redirecting = true;
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

	handleHelpButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
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

		const { redirectAfterAuth } = this.props;
		if ( redirectAfterAuth ) {
			this.props.goBackToWpAdmin( redirectAfterAuth );
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

	selectPlan = cartItem => {
		const checkoutPath = `/checkout/${ this.props.selectedSite.slug }`;
		// clears whatever we had stored in local cache
		this.props.selectPlanInAdvance( null, this.props.selectedSiteSlug );

		if ( ! cartItem || cartItem.product_slug === PLAN_JETPACK_FREE ) {
			return this.selectFreeJetpackPlan();
		}

		if ( cartItem.product_slug === get( this.props, 'selectedSite.plan.product_slug', null ) ) {
			return this.redirect( CALYPSO_PLANS_PAGE );
		}

		this.props.recordTracksEvent( 'calypso_jpc_plans_submit', {
			user: this.props.userId,
			product_slug: cartItem.product_slug,
		} );
		mc.bumpStat( 'calypso_jpc_plan_selection', cartItem.product_slug );

		addItem( cartItem );
		this.redirecting = true;
		this.props.completeFlow();
		page.redirect( checkoutPath );
	};

	storeSelectedPlan = cartItem => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			user: this.props.userId,
			plan: cartItem ? cartItem.product_slug : 'free',
		} );
		this.props.selectPlanInAdvance(
			cartItem ? cartItem.product_slug : 'free',
			this.props.siteSlug
		);
	};

	render() {
		const { interval, isRtlLayout, selectedSite, showFirst, translate } = this.props;

		if (
			this.redirecting ||
			this.hasPreSelectedPlan() ||
			( ! showFirst && ! this.props.canPurchasePlans ) ||
			( ! showFirst && this.props.hasPlan )
		) {
			return <QueryPlans />;
		}

		const helpButtonLabel = translate( 'Need help?' );

		return (
			<div>
				<QueryPlans />
				{ selectedSite && <QuerySitePlans siteId={ selectedSite.ID } /> }
				<PlansGrid
					basePlansPath={ showFirst ? '/jetpack/connect/authorize' : '/jetpack/connect/plans' }
					onSelect={ showFirst ? this.storeSelectedPlan : this.selectPlan }
					hideFreePlan={ true }
					isLanding={ false }
					interval={ interval }
					showFirst={ showFirst }
					selectedSite={ selectedSite }
				>
					<PlansSkipButton onClick={ this.handleSkipButtonClick } isRtl={ isRtlLayout } />
					<LoggedOutFormLinks>
						<JetpackConnectHappychatButton
							label={ helpButtonLabel }
							eventName="calypso_jpc_plans_chat_initiated"
						>
							<HelpButton onClick={ this.handleHelpButtonClick } label={ helpButtonLabel } />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</PlansGrid>
			</div>
		);
	}
}

export { Plans as PlansTestComponent };

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
			redirectAfterAuth: getJetpackConnectRedirectAfterAuth( state ),
			userId: user ? user.ID : null,
			canPurchasePlans: selectedSite
				? canCurrentUser( state, selectedSite.ID, 'manage_options' )
				: true,
			flowType: getFlowType( state, selectedSiteSlug ),
			isRequestingPlans: isRequestingPlans( state ),
			getPlanBySlug: searchPlanBySlug,
			calypsoStartedConnection: isCalypsoStartedConnection( state, selectedSiteSlug ),
			redirectingToWpAdmin: isRedirectingToWpAdmin( state ),
			isRtlLayout: isRtl( state ),
			hasPlan: isSiteOnPaidPlan( state, selectedSite.ID ),
		};
	},
	{
		goBackToWpAdmin,
		completeFlow,
		selectPlanInAdvance,
		recordTracksEvent,
	}
)( localize( Plans ) );
