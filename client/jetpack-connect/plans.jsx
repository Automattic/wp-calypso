/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { get, isEqual, pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	clearPlan,
	isCalypsoStartedConnection,
	retrieveFlowType,
	retrievePlan,
} from './persistence-utils';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import {
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_BUSINESS,
} from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { addItem } from 'lib/upgrades/actions';
import { goBackToWpAdmin, completeFlow } from 'state/jetpack-connect/actions';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlanBySlug } from 'state/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import {
	canCurrentUser,
	getJetpackConnectRedirectAfterAuth,
	isRtl,
	isSiteAutomatedTransfer,
} from 'state/selectors';
import { mc } from 'lib/analytics';
import { isCurrentPlanPaid, isJetpackSite } from 'state/sites/selectors';

const CALYPSO_REDIRECTION_PAGE = '/posts/';
const CALYPSO_PLANS_PAGE = '/plans/my-plan/';
const JETPACK_ADMIN_PATH = '/wp-admin/admin.php?page=jetpack';

class Plans extends Component {
	static propTypes = {
		// Connected props
		isAutomatedTransfer: PropTypes.bool, // null indicates unknown
		hasPlan: PropTypes.bool, // null indicates unknown
	};

	componentDidMount() {
		if ( ! this.maybeRedirect( this.props ) ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
				user: this.props.userId,
			} );
		}
	}

	componentWillReceiveProps = nextProps => {
		const propsToCompare = [
			'canPurchasePlans',
			'hasPlan',
			'isAutomatedTransfer',
			'isCalypsoStartedConnection',
			'notJetpack',
			'selectedPlan',
			'selectedPlanSlug',
		];

		if ( ! isEqual( pick( this.props, propsToCompare ), pick( nextProps, propsToCompare ) ) ) {
			this.maybeRedirect( nextProps );
		}
	};

	maybeRedirect = props => {
		if ( props.isAutomatedTransfer ) {
			this.props.goBackToWpAdmin( props.selectedSite.URL + JETPACK_ADMIN_PATH );
			return true;
		}
		if ( props.selectedPlanSlug ) {
			this.autoselectPlan( props );
			return true;
		}
		if ( props.hasPlan || props.notJetpack ) {
			this.redirect( CALYPSO_PLANS_PAGE );
			return true;
		}
		if ( ! props.canPurchasePlans ) {
			if ( props.isCalypsoStartedConnection ) {
				this.redirect( CALYPSO_REDIRECTION_PAGE );
			} else {
				this.redirectToWpAdmin( props );
			}
			return true;
		}
		return false;
	};

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.selectFreeJetpackPlan();
	};

	handleHelpButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	redirectToWpAdmin( props ) {
		const { redirectAfterAuth } = props;
		if ( redirectAfterAuth ) {
			props.goBackToWpAdmin( redirectAfterAuth );
		} else if ( props.selectedSite ) {
			this.props.goBackToWpAdmin( props.selectedSite.URL + JETPACK_ADMIN_PATH );
		}
		this.props.completeFlow();
	}

	redirect( path ) {
		page.redirect( path + this.props.selectedSiteSlug );
		this.props.completeFlow();
	}

	autoselectPlan( props ) {
		const { selectedPlan, selectedPlanSlug } = props;

		if ( selectedPlanSlug === PLAN_JETPACK_FREE || selectedPlanSlug === 'free' ) {
			this.selectFreeJetpackPlan();
			return;
		}
		if ( selectedPlan ) {
			this.selectPlan( selectedPlan );
			return;
		}
	}

	selectFreeJetpackPlan() {
		clearPlan();
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId,
		} );
		mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_free' );

		if ( this.props.calypsoStartedConnection ) {
			this.redirect( CALYPSO_REDIRECTION_PAGE );
		} else {
			this.redirectToWpAdmin( this.props );
		}
	}

	selectPlan = cartItem => {
		const checkoutPath = `/checkout/${ this.props.selectedSite.slug }`;
		clearPlan();

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
		this.props.completeFlow();
		page.redirect( checkoutPath );
	};

	render() {
		const {
			canPurchasePlans,
			hasPlan,
			interval,
			isAutomatedTransfer,
			isRtlLayout,
			notJetpack,
			selectedPlanSlug,
			selectedSite,
			translate,
		} = this.props;

		if (
			selectedPlanSlug ||
			notJetpack ||
			! canPurchasePlans ||
			false !== hasPlan ||
			false !== isAutomatedTransfer
		) {
			return <QueryPlans />;
		}

		const helpButtonLabel = translate( 'Need help?' );

		return (
			<div>
				<QueryPlans />
				{ selectedSite && <QuerySitePlans siteId={ selectedSite.ID } /> }
				<PlansGrid
					basePlansPath={ '/jetpack/connect/plans' }
					onSelect={ this.selectPlan }
					hideFreePlan={ true }
					isLanding={ false }
					interval={ interval }
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

const getPlanSlug = ( flowType, planSlug ) => {
	const flowTypeToSlug = {
		personal: PLAN_JETPACK_PERSONAL,
		premium: PLAN_JETPACK_PREMIUM,
		pro: PLAN_JETPACK_BUSINESS,
	};

	return flowTypeToSlug[ flowType ] || planSlug;
};

export default connect(
	state => {
		const user = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );
		const selectedSiteSlug = selectedSite ? selectedSite.slug : '';

		const flowType = retrieveFlowType();
		const preSelectedPlan = retrievePlan();
		const selectedPlanSlug = getPlanSlug( flowType, preSelectedPlan );
		const selectedPlan = getPlanBySlug( state, selectedPlanSlug );

		return {
			selectedSite,
			selectedSiteSlug,
			selectedPlan,
			selectedPlanSlug,
			isAutomatedTransfer: selectedSite ? isSiteAutomatedTransfer( state, selectedSite.ID ) : null,
			redirectAfterAuth: getJetpackConnectRedirectAfterAuth( state ),
			userId: user ? user.ID : null,
			canPurchasePlans: selectedSite
				? canCurrentUser( state, selectedSite.ID, 'manage_options' )
				: true,
			calypsoStartedConnection: isCalypsoStartedConnection( selectedSiteSlug ),
			isRtlLayout: isRtl( state ),
			hasPlan: selectedSite ? isCurrentPlanPaid( state, selectedSite.ID ) : null,
			notJetpack: ! ( selectedSite && isJetpackSite( state, selectedSite.ID ) ),
		};
	},
	{
		goBackToWpAdmin,
		completeFlow,
		recordTracksEvent,
	}
)( localize( Plans ) );
