/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { appStates } from 'state/imports/constants';
import CloseButton from 'my-sites/importer/importer-header/close-button';
import StartButton from 'my-sites/importer/importer-header/start-button';
import StopButton from 'my-sites/importer/importer-header/stop-button';
import DoneButton from 'my-sites/importer/importer-header/done-button';
import ResetButton from 'my-sites/importer/importer-header/reset-button';

/**
 * Module variables
 */
const startStates = [ appStates.DISABLED, appStates.INACTIVE ];
const cancelStates = [
	appStates.MAP_AUTHORS,
	appStates.READY_FOR_UPLOAD,
	appStates.UPLOAD_FAILURE,
	appStates.UPLOAD_SUCCESS,
	appStates.UPLOADING,
];
const stopStates = [ appStates.IMPORTING ];
const errorStates = [ appStates.IMPORT_FAILURE ];
const doneStates = [ appStates.IMPORT_SUCCESS ];

const getPositiveButton = importerState => {
	if ( includes( startStates, importerState ) ) {
		return StartButton;
	} else if ( includes( doneStates, importerState ) ) {
		return DoneButton;
	}
	return null;
};

const getNegativeButton = ( importerState, isUploading ) => {
	if ( isUploading || includes( cancelStates, importerState ) ) {
		return CloseButton;
	} else if ( includes( stopStates, importerState ) ) {
		return StopButton;
	} else if ( includes( errorStates, importerState ) ) {
		return ResetButton;
	}

	return null;
};

const ActionButtons = ( { importerStatus, site, isEnabled } ) => {
	const { importerState, isUploading } = importerStatus;

	const PositiveButton = getPositiveButton( importerState );
	const NegativeButton = getNegativeButton( importerState, isUploading );

	return (
		<Fragment>
			{ NegativeButton && (
				<NegativeButton importerStatus={ importerStatus } isEnabled={ isEnabled } site={ site } />
			) }
			{ PositiveButton && (
				<PositiveButton importerStatus={ importerStatus } isEnabled={ isEnabled } site={ site } />
			) }
		</Fragment>
	);
};

ActionButtons.propTypes = {
	importerStatus: PropTypes.shape( {
		importerState: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
	} ),
	isEnabled: PropTypes.bool.isRequired,
};

export default ActionButtons;
