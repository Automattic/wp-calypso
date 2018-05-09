/** @format */
/**
 * External dependencies
 */
// import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import config from 'config';

// Components
import HappychatConnection from 'components/happychat/connection-connected';

// Query Components
import QueryTicketSupportConfiguration from 'components/data/query-ticket-support-configuration';
import QueryLanguageNames from 'components/data/query-language-names';

// State Actions
import { openChat as openHappychat } from 'state/happychat/ui/actions';
import { initialize as initializeDirectly } from 'state/help/directly/actions';

// State Selectors
import { isRequestingSites } from 'state/sites/selectors';
import getInlineHelpSupportVariation from 'state/selectors/get-inline-help-support-variation';
import { getHelpSelectedSiteId } from 'state/help/selectors';
import { isTicketSupportConfigurationReady } from 'state/help/ticket/selectors';
import isHappychatUserEligible from 'state/happychat/selectors/is-happychat-user-eligible';
import { isDirectlyUninitialized } from 'state/selectors';

const debug = debugFactory( 'calypso:inline-help-support-query' );

class QueryInlineHelpSupportTypes extends Component {
	componentDidMount() {
		this.prepareDirectlyWidget();
	}

	componentDidUpdate() {
		// Directly initialization is a noop if it's already happened. This catches
		// instances where a state/prop change moves a user to Directly support from
		// some other variation.
		this.prepareDirectlyWidget();
	}

	prepareDirectlyWidget = () => {
		if (
			this.hasDataToDetermineVariation() &&
			// 	this.props.supportVariation === SUPPORT_DIRECTLY &&
			this.props.isDirectlyUninitialized
		) {
			this.props.initializeDirectly();
		}
	};

	/**
	 * Before determining which variation to assign, certain async data needs to be in place.
	 * This function helps assess whether we're ready to say which variation the user should see.
	 *
	 * @returns {Boolean} Whether all the data is present to determine the variation to show
	 */
	hasDataToDetermineVariation = () => {
		const ticketReadyOrError =
			this.props.ticketSupportConfigurationReady || null != this.props.ticketSupportRequestError;
		const happychatReadyOrDisabled =
			! config.isEnabled( 'happychat' ) || this.props.isHappychatUserEligible !== null;

		return ticketReadyOrError && happychatReadyOrDisabled;
	};

	render() {
		const { directlyStatus, supportVariation, shouldStartHappychatConnection } = this.props;

		debug( {
			directlyStatus,
			supportVariation,
			shouldStartHappychatConnection,
		} );

		return (
			<React.Fragment>
				<QueryTicketSupportConfiguration />
				<QueryLanguageNames />
				{ this.props.shouldStartHappychatConnection && <HappychatConnection /> }
			</React.Fragment>
		);
	}
}

export default connect(
	state => {
		const helpSelectedSiteId = getHelpSelectedSiteId( state );
		const directlyStatus = get( state, 'help.directly.status' );

		return {
			shouldStartHappychatConnection: ! isRequestingSites( state ) && !! helpSelectedSiteId,
			supportVariation: getInlineHelpSupportVariation( state ),
			ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
			isHappychatUserEligible: isHappychatUserEligible( state ),
			isDirectlyUninitialized: isDirectlyUninitialized( state ),
			directlyStatus,
		};
	},
	{
		initializeDirectly,
		openHappychat,
	}
)( QueryInlineHelpSupportTypes );
