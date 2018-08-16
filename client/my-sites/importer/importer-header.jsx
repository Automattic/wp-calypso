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
import { connectDispatcher } from './dispatcher-converter';
import { recordTracksEvent } from 'state/analytics/actions';
import ImporterLogo from 'my-sites/importer/importer-logo';

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

	controlButtonClicked = () => {
		const {
				importerStatus: { importerId, importerState, type },
				site: { ID: siteId },
				startImportFn,
			} = this.props,
			tracksType = type.endsWith( 'site-importer' ) ? type + '-wix' : type;

		if ( includes( [ ...cancelStates, ...stopStates ], importerState ) ) {
			cancelImport( siteId, importerId );

			this.props.recordTracksEvent( 'calypso_importer_main_cancel_clicked', {
				blog_id: siteId,
				importer_id: tracksType,
			} );
		} else if ( includes( startStates, importerState ) ) {
			startImportFn( siteId, type );

			this.props.recordTracksEvent( 'calypso_importer_main_start_clicked', {
				blog_id: siteId,
				importer_id: tracksType,
			} );
		} else if ( includes( doneStates, importerState ) ) {
			resetImport( siteId, importerId );

			this.props.recordTracksEvent( 'calypso_importer_main_done_clicked', {
				blog_id: siteId,
				importer_id: tracksType,
			} );
		}
	};

	getButtonText = () => {
		const { importerState } = this.props.importerStatus;

		if ( includes( startStates, importerState ) ) {
			return this.props.translate( 'Start Import', { context: 'verb' } );
		}

		if ( includes( cancelStates, importerState ) ) {
			return this.props.translate( 'Close', { context: 'verb, to Close a dialog' } );
		}

		if ( includes( stopStates, importerState ) ) {
			return this.props.translate( 'Importing…' );
		}

		if ( includes( doneStates, importerState ) ) {
			return this.props.translate( 'Done', { context: 'adjective' } );
		}
	};

	render() {
		const {
			importerStatus: { importerState },
			icon,
			isEnabled,
			title,
			description,
		} = this.props;
		const canCancel =
			isEnabled && ! includes( [ appStates.UPLOADING, ...stopStates ], importerState );
		const isScary = includes( [ ...cancelStates ], importerState );

		return (
			<header className="importer-service">
				<ImporterLogo icon={ icon } />
				<Button
					className="importer__master-control"
					disabled={ ! canCancel }
					isPrimary={ true }
					scary={ isScary }
					onClick={ this.controlButtonClicked }
				>
					{ this.getButtonText() }
				</Button>
				<div className="importer__service-info">
					<h1 className="importer__service-title">{ title }</h1>
					<p>{ description }</p>
				</div>
			</header>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	startImportFn: flowRight(
		dispatch,
		startImport
	),
} );

export default connect(
	null,
	{ recordTracksEvent }
)( connectDispatcher( null, mapDispatchToProps )( localize( ImporterHeader ) ) );
