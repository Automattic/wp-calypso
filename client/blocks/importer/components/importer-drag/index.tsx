import { SubTitle, Title } from '@automattic/onboarding';
import clsx from 'clsx';
import { includes } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { UrlData } from 'calypso/blocks/import/types';
import { ImporterConfig } from 'calypso/lib/importer/importer-config';
import ErrorPane from 'calypso/my-sites/importer/error-pane';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import ImportingPane from '../importing-pane/importing-pane';
import UploadingPane from '../uploading-pane/uploading-pane';
import type { ImportJob } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

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
	site: SiteDetails | null | undefined;
	urlData?: UrlData | null;
	renderHeading?: boolean;
	startImport: ( siteId: number, type: string ) => void;
}
const ImporterDrag: React.FunctionComponent< Props > = ( props ) => {
	const { importerStatus, importerData, site, urlData, renderHeading } = props;
	const { errorData, importerState } = importerStatus;
	const isEnabled = appStates.DISABLED !== importerState;

	return (
		<div className={ clsx( 'importer-drag', `importer-drag-${ importerData?.engine }` ) }>
			{ renderHeading && (
				<div className="import__heading import__heading-center">
					<Title>{ importerData?.title }</Title>
					<SubTitle>{ importerData?.description }</SubTitle>
				</div>
			) }
			{ errorData && (
				<ErrorPane
					type={ errorData.type }
					description={ errorData.description }
					siteSlug={ site?.slug }
					code={ errorData.code }
					importerEngine={ importerData?.engine }
				/>
			) }
			{ includes( importingStates, importerState ) && (
				<ImportingPane
					importerStatus={ importerStatus }
					sourceType={ importerData?.title }
					site={ site }
					urlData={ urlData }
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
