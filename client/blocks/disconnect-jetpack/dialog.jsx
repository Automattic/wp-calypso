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

const DisconnectJetpackDialog = ( { isBroken, isVisible, onClose, redirect, siteId } ) => (
	<Dialog
		isVisible={ isVisible }
		additionalClassNames="disconnect-jetpack-dialog"
		onClose={ onClose }
	>
		<DisconnectJetpack
			isBroken={ isBroken }
			onClose={ onClose }
			redirect={ redirect }
			siteId={ siteId }
		/>
	</Dialog>
);

DisconnectJetpackDialog.propTypes = {
	isBroken: PropTypes.bool,
	isVisible: PropTypes.bool,
	onClose: PropTypes.func,
	redirect: PropTypes.string,
	siteId: PropTypes.number,
};

export default DisconnectJetpackDialog;
