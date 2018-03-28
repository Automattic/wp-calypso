/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/route';
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import Placeholder from './plans-placeholder';
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import QueryPlans from 'components/data/query-plans';
import { getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { getSite, isRequestingSites } from 'state/sites/selectors';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { storePlan } from './persistence-utils';

const CALYPSO_JETPACK_CONNECT = '/jetpack/connect';

class PlansLanding extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string,
		interval: PropTypes.string,
		url: PropTypes.string,
	};

	static defaultProps = {
		url: '',
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_landing_view', {
			jpc_from: 'jetpack',
		} );

		this.goToPlansIfAlreadyConnected();
	}

	componentDidUpdate() {
		this.goToPlansIfAlreadyConnected();
	}

	goToPlansIfAlreadyConnected() {
		const { site } = this.props;

		if ( site ) {
			page.redirect( '/plans/' + site.slug );
		}
	}

	storeSelectedPlan = cartItem => {
		const { url } = this.props;
		let redirectUrl = CALYPSO_JETPACK_CONNECT;

		if ( url ) {
			redirectUrl = addQueryArgs( { url }, redirectUrl );
		}

		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			plan: cartItem ? cartItem.product_slug : 'free',
		} );

		storePlan( cartItem ? cartItem.product_slug : PLAN_JETPACK_FREE );

		setTimeout( () => {
			page.redirect( redirectUrl );
		}, 25 );
	};

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.storeSelectedPlan( null );
	};

	handleHelpButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	handleInfoButtonClick = info => {
		this.props.recordTracksEvent( 'calypso_jpc_help_' + info + '_click' );
	};

	plansExtendedInfo = () => {
		const { translate } = this.props;
		const headerText = translate( 'Unsure which plan is right for you?' );
		const subheaderText = translate(
			'Read out guide to choosing the right plan or compare plans in more details.'
		);

		return (
			<Card className="jetpack-connect__plan-info">
				<img
					className="jetpack-connect__plan-info-illustration"
					src={ '/calypso/images/illustrations/illustration-start-jetpack.svg' }
					alt=""
				/>
				<FormattedHeader
					className="jetpack-connect__plan-help"
					headerText={ headerText }
					subHeaderText={ subheaderText }
				/>
				<div className="jetpack-connect__plan-info-buttons">
					<Button
						primary
						href={
							'https://jetpack.com/2017/02/01/a-simple-guide-to-choosing-the-best-jetpack-plan-your-wordpress-site/'
						}
						onClick={ this.handleInfoButtonClick( 'plan_guide' ) }
					>
						{ translate( 'PLAN GUIDE' ) }
					</Button>
					<Button
						href={ 'https://jetpack.com/features/comparison' }
						onClick={ this.handleInfoButtonClick( 'feature_comparison' ) }
					>
						{ translate( 'FEATURE COMPARISON' ) }
					</Button>
				</div>
			</Card>
		);
	};

	render() {
		const { basePlansPath, interval, requestingSites, site, url } = this.props;

		// We're redirecting in componentDidMount if the site is already connected
		// so don't bother rendering any markup if this is the case
		if ( url && ( site || requestingSites ) ) {
			return <Placeholder />;
		}

		return (
			<div>
				<QueryPlans />

				<PlansGrid
					basePlansPath={ basePlansPath }
					calypsoStartedConnection={ true }
					hideFreePlan={ true }
					interval={ interval }
					isLanding={ true }
					onSelect={ this.storeSelectedPlan }
				>
					<PlansSkipButton onClick={ this.handleSkipButtonClick } />
					{ this.plansExtendedInfo() }
					<LoggedOutFormLinks>
						<JetpackConnectHappychatButton eventName="calypso_jpc_planslanding_chat_initiated">
							<HelpButton onClick={ this.handleHelpButtonClick } />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</PlansGrid>
			</div>
		);
	}
}

export default connect(
	( state, { url } ) => {
		const rawSite = url ? getJetpackSiteByUrl( state, url ) : null;
		const site = rawSite ? getSite( state, rawSite.ID ) : null;

		return {
			requestingSites: isRequestingSites( state ),
			site,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlansLanding ) );
