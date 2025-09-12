import { Card } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import ErrorPane from 'calypso/my-sites/importer/error-pane';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchImporterState, startImport, cancelImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { getImporterStatusForSiteId } from 'calypso/state/imports/selectors';
import { EngineTypes, ImporterState } from '../types';
import ExportDataGuide from './export-data-guide';
import ImportingPane from './importing-pane';
import UploadingPane from './uploading-pane';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface ContentProps {
	nextStepUrl: string;
	engine: EngineTypes;
	selectedSite: SiteDetails;
	siteSlug: string;
	fromSite: string;
	skipNextStep: () => void;
}

const isShowStart = ( importerState: ImporterState | undefined ) => {
	return (
		importerState &&
		( [ appStates.DISABLED, appStates.INACTIVE ] as ImporterState[] ).includes( importerState )
	);
};

const isImporting = ( importerState: ImporterState | undefined ) => {
	return (
		importerState &&
		(
			[
				appStates.IMPORT_FAILURE,
				appStates.IMPORT_SUCCESS,
				appStates.IMPORTING,
				appStates.MAP_AUTHORS,
			] as ImporterState[]
		 ).includes( importerState )
	);
};

const isUploading = ( importerState: ImporterState | undefined ) => {
	return (
		importerState &&
		(
			[
				appStates.UPLOAD_PROCESSING,
				appStates.READY_FOR_UPLOAD,
				appStates.UPLOAD_FAILURE,
				appStates.UPLOAD_SUCCESS,
				appStates.UPLOADING,
			] as ImporterState[]
		 ).includes( importerState )
	);
};

const isEnabled = ( importerState: ImporterState ) => {
	return importerState && appStates.DISABLED !== importerState;
};

export default function Content( {
	nextStepUrl,
	engine,
	selectedSite,
	siteSlug,
	fromSite,
	skipNextStep,
}: ContentProps ) {
	const siteTitle = selectedSite.title;
	const siteId = selectedSite.ID;

	const queryClient = useQueryClient();

	const invalidateCardData = () => {
		queryClient.invalidateQueries( {
			queryKey: [ 'paid-newsletter-importer', siteId, engine ],
		} );
	};

	const siteImports = useSelector( ( state ) => getImporterStatusForSiteId( state, siteId ) );

	const dispatch = useDispatch();

	function fetchImporters() {
		siteId && dispatch( fetchImporterState( siteId ) );
	}

	useEffect( fetchImporters, [ siteId, dispatch ] );
	useEffect( startImporting, [ siteId, dispatch, siteImports ] );

	function startImporting() {
		siteId && siteImports.length === 0 && dispatch( startImport( siteId ) );
	}

	const importerStatus = siteImports[ 0 ];
	if ( importerStatus ) {
		importerStatus.type = 'importer-type-substack';
	}
	const { errorData, importerState, importerId } = importerStatus || {};

	const { title, uploadDescription, optionalUrl, acceptedFileTypes, overrideDestination } =
		importerConfig( {
			importerState: importerStatus?.importerState,
			siteSlug,
			siteTitle,
		} ).substack;

	const handleImportStart = () => {
		if ( ! overrideDestination ) {
			dispatch( startImport( siteId, importerStatus.type ) );
		}

		dispatch(
			recordTracksEvent( 'calypso_importer_main_start_clicked', {
				blog_id: siteId,
				importer_id: importerStatus.type,
			} )
		);
	};

	const cardProps = {
		className: clsx( 'importer__file-importer-card', {
			'is-compact': isShowStart( importerState ),
			'is-disabled': ! isEnabled( importerState ),
		} ),
		/**
		 * Override where the user lands when they click the importer.
		 *
		 * This is used for the new Migration logic for the moment.
		 */
		...( overrideDestination
			? {
					href: overrideDestination
						.replace( '%SITE_SLUG%', siteSlug )
						.replace( '%SITE_ID%', siteId.toString() ),
			  }
			: undefined ),
		/**
		 * I am not sure why this is needed.
		 */
		...( isShowStart( importerState )
			? { displayAsLink: true, tagName: 'button', onClick: () => handleImportStart() }
			: undefined ),
	};

	return (
		<Card>
			<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />
			{ ! isImporting( importerState ) && (
				<ExportDataGuide fromSite={ fromSite } selectedSiteUrl={ selectedSite.URL } />
			) }
			{ importerStatus && (
				<Card { ...cardProps }>
					{ errorData && (
						<ErrorPane
							type={ errorData.type }
							description={ errorData.description }
							siteSlug={ siteSlug }
							code={ errorData.code }
							retryImport={ () => {
								dispatch( cancelImport( siteId, importerId ) );
							} }
							importerEngine={ engine }
						/>
					) }

					{ isUploading( importerState ) && (
						<UploadingPane
							isEnabled={ isEnabled( importerState ) }
							description={ uploadDescription }
							importerStatus={ importerStatus }
							site={ selectedSite }
							optionalUrl={ optionalUrl }
							fromSite={ fromSite }
							acceptedFileTypes={ acceptedFileTypes }
							nextStepUrl={ nextStepUrl }
							skipNextStep={ skipNextStep }
						/>
					) }

					{ isImporting( importerState ) && (
						<ImportingPane
							importerStatus={ importerStatus }
							sourceType={ title }
							site={ selectedSite }
							nextStepUrl={ nextStepUrl }
							invalidateCardData={ invalidateCardData }
						/>
					) }
				</Card>
			) }
		</Card>
	);
}
