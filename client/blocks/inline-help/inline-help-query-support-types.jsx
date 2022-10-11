import config from '@automattic/calypso-config';
import { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import QueryTicketSupportConfiguration from 'calypso/components/data/query-ticket-support-configuration';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import isHappychatUserEligible from 'calypso/state/happychat/selectors/is-happychat-user-eligible';
import { getHelpSelectedSiteId } from 'calypso/state/help/selectors';
import {
	isTicketSupportConfigurationReady,
	getTicketSupportRequestError,
} from 'calypso/state/help/ticket/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';

class QueryInlineHelpSupportTypes extends Component {
	/**
	 * Before determining which variation to assign, certain async data needs to be in place.
	 * This function helps assess whether we're ready to say which variation the user should see.
	 *
	 * @returns {boolean} Whether all the data is present to determine the variation to show
	 */
	hasDataToDetermineVariation() {
		const ticketReadyOrError =
			this.props.ticketSupportConfigurationReady || this.props.ticketSupportRequestError !== null;
		const happychatReadyOrDisabled =
			! config.isEnabled( 'happychat' ) || this.props.isHappychatUserEligible !== null;

		return ticketReadyOrError && happychatReadyOrDisabled;
	}

	render() {
		return (
			<Fragment>
				<QueryTicketSupportConfiguration />
				{ this.props.shouldStartHappychatConnection && <HappychatConnection /> }
			</Fragment>
		);
	}
}

export default connect( ( state ) => ( {
	shouldStartHappychatConnection: ! isRequestingSites( state ) && !! getHelpSelectedSiteId( state ),
	ticketSupportConfigurationReady: isTicketSupportConfigurationReady( state ),
	ticketSupportRequestError: getTicketSupportRequestError( state ),
	isHappychatUserEligible: isHappychatUserEligible( state ),
} ) )( QueryInlineHelpSupportTypes );
