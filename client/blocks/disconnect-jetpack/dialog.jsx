/**
 *
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import DisconnectJetpack from './';

const DisconnectJetpackDialog = ( {
	disconnectHref,
	isBroken,
	isVisible,
	onClose,
	siteId,
	stayConnectedHref,
} ) => (
	<Dialog
		isVisible={ isVisible }
		additionalClassNames="disconnect-jetpack-dialog"
		onClose={ onClose }
	>
		<DisconnectJetpack
			disconnectHref={ disconnectHref }
			isBroken={ isBroken }
			onDisconnectClick={ onClose }
			onStayConnectedClick={ onClose }
			siteId={ siteId }
			stayConnectedHref={ stayConnectedHref }
		/>
	</Dialog>
);

DisconnectJetpackDialog.propTypes = {
	disconnectHref: PropTypes.string,
	isBroken: PropTypes.bool,
	isVisible: PropTypes.bool,
	onClose: PropTypes.func,
	siteId: PropTypes.number,
	stayConnectedHref: PropTypes.string,
};

export default DisconnectJetpackDialog;
