/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import QueryPlans from 'components/data/query-plans';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { storePlan } from './persistence-utils';

class PlansStatic extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string,
		interval: PropTypes.string,
	};

	static defaultProps = {
		basePlansPath: '/jetpack/connect/store',
	};

	storeSelectedPlan = cartItem => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			plan: cartItem ? cartItem.product_slug : 'free',
		} );

		storePlan( cartItem ? cartItem.product_slug : PLAN_JETPACK_FREE );
	};

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.storeSelectedPlan( null );
	};

	handleHelpButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	render() {
		const { basePlansPath, interval } = this.props;

		return (
			<Fragment>
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
						<JetpackConnectHappychatButton eventName="calypso_jpc_planslanding_chat_initiated">
							<HelpButton onClick={ this.handleHelpButtonClick } />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</PlansGrid>
			</Fragment>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( PlansStatic );
