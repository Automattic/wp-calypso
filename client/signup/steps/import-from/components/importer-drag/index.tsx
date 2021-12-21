import { includes } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { ImporterConfig } from 'calypso/lib/importer/importer-config';
import ErrorPane from 'calypso/my-sites/importer/error-pane';
import ImporterHeader from 'calypso/my-sites/importer/importer-header';
import ImportingPane from 'calypso/my-sites/importer/importing-pane';
import UploadingPane from 'calypso/my-sites/importer/uploading-pane';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { ImportJob } from '../../types';

export interface Site {
	ID: number;
	name: string;
	URL: string;
}

/**
 * Module variables
 */
const importingStates = [
	appStates.IMPORT_FAILURE,
	appStates.IMPORT_SUCCESS,
	appStates.IMPORTING,
	appStates.MAP_AUTHORS,
];

const uploadingStates = [
	appStates.UPLOAD_PROCESSING,
	appStates.READY_FOR_UPLOAD,
	appStates.UPLOAD_FAILURE,
	appStates.UPLOAD_SUCCESS,
	appStates.UPLOADING,
];

interface Props {
	importerStatus: ImportJob;
	importerData: ImporterConfig;
	site: Site;
	startImport: ( siteId: number, type: string ) => void;
}
const ImporterDrag: React.FunctionComponent< Props > = ( props ) => {
	const { importerStatus, importerData, site /*, startImport*/ } = props;
	const { errorData, importerState } = importerStatus;
	const isEnabled = appStates.DISABLED !== importerState;

	return (
		<div>
			<ImporterHeader
				importerStatus={ importerStatus }
				icon={ importerData?.icon }
				title={ importerData?.title }
				description={ importerData?.description }
			/>
			{ errorData && <ErrorPane type={ errorData.type } description={ errorData.description } /> }
			{ includes( importingStates, importerState ) && (
				<ImportingPane
					importerStatus={ importerStatus }
					sourceType={ importerData?.title }
					site={ site }
				/>
			) }
			{ includes( uploadingStates, importerState ) && (
				<UploadingPane
					isEnabled={ isEnabled }
					description={ importerData?.uploadDescription }
					importerStatus={ importerStatus }
					site={ site }
					optionalUrl={ importerData?.optionalUrl }
				/>
			) }
		</div>
	);
};

export default connect( null, { recordTracksEvent, startImport } )( ImporterDrag );
