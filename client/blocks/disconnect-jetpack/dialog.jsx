/**
 * @format
 *
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import DisconnectJetpack from '.';

const DisconnectJetpackDialog = ( { isBroken, isVisible, onClose, disconnectHref, siteId } ) => (
	<Dialog
		isVisible={ isVisible }
		additionalClassNames="disconnect-jetpack-dialog"
		onClose={ onClose }
	>
		<DisconnectJetpack
			disconnectHref={ disconnectHref }
			isBroken={ isBroken }
			onDisconnect={ onClose }
			onStayConnected={ onClose }
			siteId={ siteId }
		/>
	</Dialog>
);

DisconnectJetpackDialog.propTypes = {
	disconnectHref: PropTypes.string,
	isBroken: PropTypes.bool,
	isVisible: PropTypes.bool,
	onClose: PropTypes.func,
	redirect: PropTypes.string,
	siteId: PropTypes.number,
	stayConnectedHref: PropTypes.string,
};

export default DisconnectJetpackDialog;
