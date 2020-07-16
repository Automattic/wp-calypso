/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import config from 'config';
import HappychatConnection from 'components/happychat/connection-connected';
import QueryTicketSupportConfiguration from 'components/data/query-ticket-support-configuration';
import QueryLanguageNames from 'components/data/query-language-names';
import QuerySupportHistory from 'components/data/query-support-history';
import { openChat as openHappychat } from 'state/happychat/ui/actions';
import { initialize as initializeDirectly } from 'state/help/directly/actions';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { getHelpSelectedSiteId } from 'state/help/selectors';
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'state/help/ticket/selectors';
import isHappychatUserEligible from 'state/happychat/selectors/is-happychat-user-eligible';
import isDirectlyUninitialized from 'state/selectors/is-directly-uninitialized';

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
		if ( this.hasDataToDetermineVariation() && this.props.isDirectlyUninitialized ) {
			this.props.initializeDirectly();
		}
	};

	/**
	 * Before determining which variation to assign, certain async data needs to be in place.
	 * This function helps assess whether we're ready to say which variation the user should see.
	 *
	 * @returns {boolean} Whether all the data is present to determine the variation to show
	 */
	hasDataToDetermineVariation = () => {
		const ticketReadyOrError =
			this.props.ticketSupportConfigurationReady || this.props.ticketSupportRequestError !== null;
		const happychatReadyOrDisabled =
			! config.isEnabled( 'happychat' ) || this.props.isHappychatUserEligible !== null;

		return ticketReadyOrError && happychatReadyOrDisabled;
	};

	render() {
		return (
			<React.Fragment>
				<QueryTicketSupportConfiguration />
				<QuerySupportHistory email={ this.props.currentUserEmail } />
				<QueryLanguageNames />
				{ this.props.shouldStartHappychatConnection && <HappychatConnection /> }
			</React.Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		shouldStartHappychatConnection:
			! isRequestingSites( state ) && !! getHelpSelectedSiteId( state ),
		ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
		ticketSupportRequestError: getTicketSupportRequestError( state ),
		isHappychatUserEligible: isHappychatUserEligible( state ),
		isDirectlyUninitialized: isDirectlyUninitialized( state ),
		currentUserEmail: getCurrentUserEmail( state ),
	} ),
	{
		initializeDirectly,
		openHappychat,
	}
)( QueryInlineHelpSupportTypes );
