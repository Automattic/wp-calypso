/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { flowRight, includes } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import { appStates } from 'state/imports/constants';
import { cancelImport, resetImport, startImport } from 'lib/importer/actions';
import { connectDispatcher } from 'my-sites/importer/dispatcher-converter';
import SiteImporterLogo from 'my-sites/importer/site-importer/logo';
import { recordTracksEvent } from 'state/analytics/actions';
import ImporterLogo from 'my-sites/importer/importer-logo';

import CloseButton from 'my-sites/importer/importer-header/close-button';
import StartButton from 'my-sites/importer/importer-header/start-button';
import StopButton from 'my-sites/importer/importer-header/stop-button';
import DoneButton from 'my-sites/importer/importer-header/done-button';

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
const stopStates = [ appStates.IMPORT_FAILURE, appStates.IMPORTING ];
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

	getLogo = icon => {
		if ( includes( [ 'wordpress', 'medium', 'blogger-alt' ], icon ) ) {
			return <SocialLogo className="importer__service-icon" icon={ icon } size={ 48 } />;
		}

		if ( includes( [ 'site-importer' ], icon ) ) {
			return <SiteImporterLogo />;
		}
		return (
			<svg
				className="importer__service-icon"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			/>
		);
	};

	getButtonComponent() {
		const { importerState } = this.props.importerStatus;

		if ( includes( cancelStates, importerState ) ) {
			return CloseButton;

		} else if ( includes( stopStates, importerState ) ) {
			return StopButton;

		} else if ( includes( startStates, importerState ) ) {
			return StartButton;

		} else if ( includes( doneStates, importerState ) ) {
			return DoneButton;

		}

		return null;
	}

	render() {
		const {
			importerStatus,
			icon,
			isEnabled,
			title,
			description,
		} = this.props;
		const { importerState } = importerStatus;
		const ButtonComponent = this.getButtonComponent();

		return (
			<header className="importer-service">
				<ImporterLogo icon={ icon } />
				<ButtonComponent
					importerStatus={ importerStatus }
					isEnabled={ isEnabled }
					site={ this.props.site }
				/>
				<div className="importer__service-info">
					<h1 className="importer__service-title">{ title }</h1>
					<p>{ description }</p>
				</div>
			</header>
		);
	}
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( ImporterHeader ) );
