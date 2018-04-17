/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { flowRight, includes } from 'lodash';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import { appStates } from 'state/imports/constants';
import { cancelImport, resetImport, startImport } from 'lib/importer/actions';
import { connectDispatcher } from './dispatcher-converter';
import SiteImporterPlaceholderLogo from './site-importer/placeholder-logo';

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
			startImport,
		} = this.props;

		if ( includes( [ ...cancelStates, ...stopStates ], importerState ) ) {
			cancelImport( siteId, importerId );
		} else if ( includes( startStates, importerState ) ) {
			startImport( siteId, type );
		} else if ( includes( doneStates, importerState ) ) {
			resetImport( siteId, importerId );
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
			return this.props.translate( 'Importing...' );
		}

		if ( includes( doneStates, importerState ) ) {
			return this.props.translate( 'Done', { context: 'adjective' } );
		}
	};

	getLogo = icon => {
		if ( includes( [ 'wordpress', 'medium' ], icon ) ) {
			return <SocialLogo className="importer__service-icon" icon={ icon } size={ 48 } />;
		}

		if ( includes( [ 'site-importer' ], icon ) ) {
			return <SiteImporterPlaceholderLogo />;
		}
		return (
			<svg
				className="importer__service-icon"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			/>
		);
	};

	render() {
		const { importerStatus: { importerState }, icon, isEnabled, title, description } = this.props;
		const canCancel =
			isEnabled && ! includes( [ appStates.UPLOADING, ...stopStates ], importerState );
		const isScary = includes( [ ...cancelStates ], importerState );

		return (
			<header className="importer-service">
				{ this.getLogo( icon ) }
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
	startImport: flowRight( dispatch, startImport ),
} );

export default connectDispatcher( null, mapDispatchToProps )( localize( ImporterHeader ) );
