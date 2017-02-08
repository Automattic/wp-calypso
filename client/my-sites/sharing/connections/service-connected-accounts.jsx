/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordGoogleEvent } from 'state/analytics/actions';

const SharingServiceConnectedAccounts = ( { children, onAddConnection, recordEvent, service, translate } ) => {
	const connectAnother = () => {
		onAddConnection( service );
		recordEvent( 'Sharing', 'Clicked Connect Another Account Button', service.ID );
	};

	return (
		<div className="sharing-service-accounts-detail">
			<ul className="sharing-service-connected-accounts">
				{ children }
			</ul>
			{ 'publicize' === service.type && (
				<a onClick={ connectAnother } className="button new-account">
					{ translate( 'Connect a different account', { comment: 'Sharing: Publicize connections' } ) }
				</a>
			) }
		</div>
	);
};

SharingServiceConnectedAccounts.propTypes = {
	onAddConnection: PropTypes.func,      // Handler to invoke when adding a new connection
	recordEvent: PropTypes.func,          // Redux action to track an event
	service: PropTypes.object.isRequired, // The service object
	translate: PropTypes.func,
};

SharingServiceConnectedAccounts.defaultProps = {
	onAddConnection: () => {},
	recordEvent: () => {},
	translate: identity,
};

export default connect(
	null,
	{
		recordEvent: recordGoogleEvent,
	},
)( localize( SharingServiceConnectedAccounts ) );
