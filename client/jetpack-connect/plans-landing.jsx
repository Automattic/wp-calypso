/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import { recordTracksEvent } from 'state/analytics/actions';
import { selectPlanInAdvance } from 'state/jetpack-connect/actions';
import { getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { getSite, isRequestingSites } from 'state/sites/selectors';
import QueryPlans from 'components/data/query-plans';
import addQueryArgs from 'lib/route/add-query-args';

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
		this.props.selectPlanInAdvance( cartItem ? cartItem.product_slug : 'free', '*' );

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

	render() {
		const { basePlansPath, interval, requestingSites, site } = this.props;

		// We're redirecting in componentDidMount if the site is already connected
		// so don't bother rendering any markup if this is the case
		if ( site || requestingSites ) {
			return null;
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
					<LoggedOutFormLinks>
						<JetpackConnectHappychatButton eventName="calypso_jpc_plansanding_chat_initiated">
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
		selectPlanInAdvance,
	}
)( PlansLanding );
