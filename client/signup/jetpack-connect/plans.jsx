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
import { PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS } from 'lib/plans/constants';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { isCurrentPlanPaid } from 'state/sites/selectors';
import { getFlowType } from 'state/jetpack-connect/selectors';
import Main from 'components/main';
import StepHeader from '../step-header';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { addItem } from 'lib/upgrades/actions';
import { getAuthorizationData, isCalypsoStartedConnection } from 'state/jetpack-connect/selectors';
import { goBackToWpAdmin } from 'state/jetpack-connect/actions';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { isRequestingPlans, getPlanBySlug } from 'state/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { canCurrentUser } from 'state/current-user/selectors';

const CALYPSO_REDIRECTION_PAGE = '/posts/';
const CALYPSO_PLAN_PAGE = '/plans/my-plan/';

class Plans extends Component {
	constructor() {
		super();
		this.selectPlan = this.selectPlan.bind( this );
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
		intervalType: 'yearly'
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
			user: this.props.userId
		} );

		if ( this.isFlowTypePaid() ) {
			return this.autoselectPlan();
		}
	}

	componentDidUpdate() {
		if ( this.props.calypsoStartedConnection ) {
			if ( this.props.hasPaidPlan ) {
				page.redirect( CALYPSO_PLAN_PAGE + this.props.selectedSite.slug );
			}
			if ( ! this.props.canPurchasePlans ) {
				page.redirect( CALYPSO_REDIRECTION_PAGE + this.props.selectedSite.slug );
			}

			if ( ! this.props.isRequestingPlans && this.isFlowTypePaid() ) {
				return this.autoselectPlan();
			}
		} else if ( this.props.hasPaidPlan || ! this.props.canPurchasePlans ) {
			const { queryObject } = this.props.jetpackConnectAuthorize;
			this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		}
	}

	isFlowTypePaid() {
		return this.props.flowType === 'pro' || this.props.flowType === 'premium';
	}

	autoselectPlan() {
		if ( ! this.isFlowTypePaid() ) {
			return;
		}

		let planSlug = '';
		if ( this.props.flowType === 'pro' ) {
			planSlug = PLAN_JETPACK_BUSINESS;
		} else if ( this.props.flowType === 'premium' ) {
			planSlug = PLAN_JETPACK_PREMIUM;
		}

		const plan = this.props.getPlanBySlug( planSlug );
		if ( plan ) {
			this.selectPlan( plan );
			return;
		}
	}

	selectFreeJetpackPlan() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId
		} );
		if ( this.props.calypsoStartedConnection ) {
			page.redirect( CALYPSO_PLAN_PAGE + this.props.selectedSite.slug );
		} else {
			const { queryObject } = this.props.jetpackConnectAuthorize;
			this.props.goBackToWpAdmin( queryObject.redirect_after_auth );
		}
	}

	selectPlan( cartItem ) {
		const checkoutPath = `/checkout/${ this.props.selectedSite.slug }`;
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
		addItem( cartItem );
		page( checkoutPath );
	}

	render() {
		const { translate } = this.props;

		if ( this.isFlowTypePaid() ) {
			return null;
		}

		if ( ! this.props.canPurchasePlans || this.props.hasPaidPlan ) {
			return null;
		}

		return (
			<div>
				<Main wideLayout>
					<QueryPlans />
					<QuerySitePlans siteId={ this.props.selectedSite.ID } />
					<div className="jetpack-connect__plans">
						<StepHeader
							headerText={ translate( 'Your site is now connected!' ) }
							subHeaderText={ translate( 'Now pick a plan that\'s right for you.' ) }
							step={ 1 }
							steps={ 3 } />

						<div id="plans">
							<PlansFeaturesMain
								site={ this.props.selectedSite }
								isInSignup={ ! this.props.hasPaidPlan }
								isInJetpackConnect={ true }
								onUpgradeClick={ this.selectPlan }
								intervalType={ this.props.intervalType } />
						</div>
					</div>
				</Main>
			</div>
		);
	}
}

export default connect(
	state => {
		const user = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );

		const searchPlanBySlug = ( planSlug ) => {
			return getPlanBySlug( state, planSlug );
		};

		const hasPaidPlan = isCurrentPlanPaid( state, selectedSite.ID );

		return {
			selectedSite,
			hasPaidPlan: hasPaidPlan,
			sitePlans: getPlansBySite( state, selectedSite ),
			jetpackConnectAuthorize: getAuthorizationData( state ),
			userId: user ? user.ID : null,
			canPurchasePlans: canCurrentUser( state, selectedSite.ID, 'manage_options' ),
			flowType: getFlowType( state, selectedSite && selectedSite.slug ),
			isRequestingPlans: isRequestingPlans( state ),
			getPlanBySlug: searchPlanBySlug,
			calypsoStartedConnection: isCalypsoStartedConnection( state, selectedSite.slug )
		};
	},
	{
		goBackToWpAdmin,
		recordTracksEvent
	}
)( localize( Plans ) );
