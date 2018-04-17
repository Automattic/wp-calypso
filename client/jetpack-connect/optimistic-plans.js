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
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import PlansGrid from './plans-grid';
import PlansExtendedInfo from './plans-extended-info';
import PlansSkipButton from './plans-skip-button';
import QueryPlans from 'components/data/query-plans';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { storePlan } from './persistence-utils';

const CALYPSO_JETPACK_CONNECT = '/jetpack/connect';

class PlansLanding extends Component {
	static propTypes = {
		clientId: PropTypes.number.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_optimistic_view' );
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

	handleInfoButtonClick = info => () => {
		this.props.recordTracksEvent( 'calypso_jpc_external_help_click', {
			help_type: info,
		} );
	};

	render() {
		const { interval } = this.props;

		return (
			<React.Fragment>
				<QueryPlans />

				<PlansGrid
					basePlansPath={ '/jetpack/connect/store' }
					calypsoStartedConnection={ true }
					hideFreePlan={ true }
					interval={ interval }
					isLanding={ true }
					onSelect={ this.storeSelectedPlan }
					site={ { ID: this.props.clientId, jetpack: true, plan: {}, isUpgradeable: () => true } }
				>
					<PlansSkipButton onClick={ this.handleSkipButtonClick } />
					<PlansExtendedInfo recordTracks={ this.handleInfoButtonClick } />
					<LoggedOutFormLinks>
						<JetpackConnectHappychatButton eventName="calypso_jpc_planslanding_chat_initiated">
							<HelpButton onClick={ this.handleHelpButtonClick } />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</PlansGrid>
			</React.Fragment>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( PlansLanding ) );
