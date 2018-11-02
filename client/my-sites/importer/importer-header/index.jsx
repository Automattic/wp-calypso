/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { get, includes } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { appStates } from 'state/imports/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import ImporterLogo from 'my-sites/importer/importer-logo';

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

class ImporterHeader extends React.PureComponent {
	static displayName = 'ImporterHeader';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		description: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired,
	};

	getButtonComponent() {
		const { importerState, isUploading } = this.props.importerStatus;

		if ( isUploading || includes( cancelStates, importerState ) ) {
			return CloseButton;
		} else if ( includes( stopStates, importerState ) ) {
			return StopButton;
		} else if ( includes( startStates, importerState ) ) {
			return StartButton;
		} else if ( includes( doneStates, importerState ) ) {
			return DoneButton;
		} else if ( includes( errorStates, importerState ) ) {
			return ResetButton;
		}

		return null;
	}

	render() {
		const { importerStatus, icon, isEnabled, title, description } = this.props;
		const ButtonComponent = this.getButtonComponent();

		return (
			<header className="importer-header">
				<ImporterLogo icon={ icon } />
				{ ButtonComponent && (
					<ButtonComponent
						importerStatus={ importerStatus }
						isEnabled={ isEnabled }
						site={ this.props.site }
					/>
				) }
				<div className="importer-header__service-info">
					<h1 className="importer-header__service-title">{ title }</h1>
					<p>{ description }</p>
				</div>
			</header>
		);
	}
}

export default connect(
	state => ( {
		isUploading: get( state, 'imports.uploads.inProgress' ),
	} ),
	{ recordTracksEvent }
)( localize( ImporterHeader ) );
