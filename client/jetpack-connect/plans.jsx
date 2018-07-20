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
import DocumentHead from 'components/data/document-head';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import Placeholder from './plans-placeholder';
import PlansGrid from './plans-grid';
import PlansExtendedInfo from './plans-extended-info';
import PlansSkipButton from 'components/plans/plans-skip-button';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { addItem } from 'lib/upgrades/actions';
import { addQueryArgs } from 'lib/route';
import { clearPlan, isCalypsoStartedConnection, retrievePlan } from './persistence-utils';
import { completeFlow } from 'state/jetpack-connect/actions';
import { externalRedirect } from 'lib/route/path';
import { getCurrentUser } from 'state/current-user/selectors';
import { getPlanBySlug } from 'state/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'state/sites/selectors';
import { JPC_PATH_PLANS } from './constants';
import { mc } from 'lib/analytics';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import isRtl from 'state/selectors/is-rtl';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

const CALYPSO_PLANS_PAGE = '/plans/';
const CALYPSO_MY_PLAN_PAGE = '/plans/my-plan/';
const CALYPSO_REDIRECTION_PAGE = '/posts/';
const JETPACK_ADMIN_PATH = '/wp-admin/admin.php?page=jetpack';

class Plans extends Component {
	static propTypes = {
		queryRedirect: PropTypes.string,

		// Connected props
		hasPlan: PropTypes.bool, // null indicates unknown
		isAutomatedTransfer: PropTypes.bool, // null indicates unknown
	};

	redirecting = false;

	componentDidMount() {
		this.maybeRedirect();
		if ( ! this.redirecting ) {
			this.props.recordTracksEvent( 'calypso_jpc_plans_view', {
				user: this.props.userId,
			} );
		}
	}

	componentDidUpdate() {
		if ( ! this.redirecting ) {
			this.maybeRedirect();
		}
	}

	maybeRedirect() {
		if ( this.props.isAutomatedTransfer ) {
			return externalRedirect( this.props.selectedSite.URL + JETPACK_ADMIN_PATH );
		}
		if ( this.props.selectedPlan ) {
			return this.selectPlan( this.props.selectedPlan );
		}
		if ( this.props.hasPlan || this.props.notJetpack ) {
			return this.redirect( CALYPSO_PLANS_PAGE );
		}
		if ( ! this.props.selectedSite && this.props.isSitesInitialized ) {
			// Invalid site
			return this.redirect( JPC_PATH_PLANS );
		}
		if ( ! this.props.canPurchasePlans ) {
			if ( this.props.calypsoStartedConnection ) {
				return this.redirectToCalypso();
			}
			return this.redirectToWpAdmin();
		}
	}

	redirectToCalypso() {
		const { canPurchasePlans, selectedSiteSlug } = this.props;

		if ( selectedSiteSlug && canPurchasePlans ) {
			// Redirect to "My Plan" page with the "Jetpack Basic Tour" guided tour enabled.
			// For more details about guided tours, see layout/guided-tours/README.md
			return this.redirect( CALYPSO_MY_PLAN_PAGE, { tour: 'jetpack' } );
		}

		return this.redirect( CALYPSO_REDIRECTION_PAGE );
	}

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.selectFreeJetpackPlan();
	};

	redirectToWpAdmin() {
		const { queryRedirect } = this.props;
		if ( queryRedirect ) {
			externalRedirect( queryRedirect );
			this.redirecting = true;
			this.props.completeFlow();
		} else if ( this.props.selectedSite ) {
			externalRedirect( this.props.selectedSite.URL + JETPACK_ADMIN_PATH );
			this.redirecting = true;
			this.props.completeFlow();
		}
	}

	redirect( path, args ) {
		let redirectTo = path + this.props.selectedSiteSlug;

		if ( args ) {
			redirectTo = addQueryArgs( args, redirectTo );
		}

		page.redirect( redirectTo );
		this.redirecting = true;
		this.props.completeFlow();
	}

	selectFreeJetpackPlan() {
		clearPlan();
		this.props.recordTracksEvent( 'calypso_jpc_plans_submit_free', {
			user: this.props.userId,
		} );
		mc.bumpStat( 'calypso_jpc_plan_selection', 'jetpack_free' );

		if ( this.props.calypsoStartedConnection ) {
			this.redirectToCalypso();
		} else {
			this.redirectToWpAdmin();
		}
	}

	selectPlan = cartItem => {
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
		this.redirect( '/checkout/' );
	};

	shouldShowPlaceholder() {
		return (
			this.redirecting ||
			this.props.selectedPlanSlug ||
			false !== this.props.notJetpack ||
			! this.props.canPurchasePlans ||
			false !== this.props.hasPlan ||
			false !== this.props.isAutomatedTransfer
		);
	}

	handleInfoButtonClick = info => () => {
		this.props.recordTracksEvent( 'calypso_jpc_external_help_click', {
			help_type: info,
		} );
	};

	render() {
		const { interval, isRtlLayout, selectedSite, translate } = this.props;

		if ( this.shouldShowPlaceholder() ) {
			return (
				<>
					<QueryPlans />
					<Placeholder />
				</>
			);
		}

		const helpButtonLabel = translate( 'Need help?' );

		return (
			<>
				<DocumentHead title={ translate( 'Plans' ) } />
				<QueryPlans />
				{ selectedSite && <QuerySitePlans siteId={ selectedSite.ID } /> }
				<PlansGrid
					basePlansPath={ this.props.basePlansPath }
					onSelect={ this.selectPlan }
					hideFreePlan={ true }
					isLanding={ false }
					interval={ interval }
					selectedSite={ selectedSite }
				>
					<PlansSkipButton onClick={ this.handleSkipButtonClick } isRtl={ isRtlLayout } />
					<PlansExtendedInfo recordTracks={ this.handleInfoButtonClick } />
					<LoggedOutFormLinks>
						<JetpackConnectHappychatButton
							label={ helpButtonLabel }
							eventName="calypso_jpc_plans_chat_initiated"
						>
							<HelpButton label={ helpButtonLabel } />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</PlansGrid>
			</>
		);
	}
}

export { Plans as PlansTestComponent };

export default connect(
	state => {
		const user = getCurrentUser( state );
		const selectedSite = getSelectedSite( state );
		const selectedSiteSlug = selectedSite ? selectedSite.slug : '';

		const selectedPlanSlug = retrievePlan();
		const selectedPlan = getPlanBySlug( state, selectedPlanSlug );

		return {
			calypsoStartedConnection: isCalypsoStartedConnection( selectedSiteSlug ),
			canPurchasePlans: selectedSite
				? canCurrentUser( state, selectedSite.ID, 'manage_options' )
				: true,
			hasPlan: selectedSite ? isCurrentPlanPaid( state, selectedSite.ID ) : null,
			isAutomatedTransfer: selectedSite ? isSiteAutomatedTransfer( state, selectedSite.ID ) : null,
			isRtlLayout: isRtl( state ),
			isSitesInitialized: hasInitializedSites( state ),
			notJetpack: selectedSite ? ! isJetpackSite( state, selectedSite.ID ) : null,
			selectedPlan,
			selectedPlanSlug,
			selectedSite,
			selectedSiteSlug,
			userId: user ? user.ID : null,
		};
	},
	{
		completeFlow,
		recordTracksEvent,
	}
)( localize( Plans ) );
