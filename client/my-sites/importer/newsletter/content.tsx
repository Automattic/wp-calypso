import { Card } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { ContentDataHint } from 'calypso/my-sites/importer/newsletter/content-data-hint';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchImporterState, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { getImporterStatusForSiteId } from 'calypso/state/imports/selectors';
import FileImporter from './content-upload/file-importer';
import { EngineTypes } from './types';
import type { SiteDetails } from '@automattic/data-stores';

interface ContentProps {
	nextStepUrl?: string;
	engine: EngineTypes;
	selectedSite: SiteDetails;
	siteSlug: string;
	fromSite: string;
	onContinue?: () => void;
	skipNextStep: () => void;
}

export default function Content( {
	nextStepUrl,
	engine,
	selectedSite,
	onContinue,
	siteSlug,
	fromSite,
	skipNextStep,
}: ContentProps ) {
	const siteTitle = selectedSite.title;
	const siteId = selectedSite.ID;

	const queryClient = useQueryClient();

	const invalidateCardData = () => {
		queryClient.invalidateQueries( {
			queryKey: [ 'paid-newsletter-importer', selectedSite.ID, engine ],
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

	const importerData = importerConfig( {
		importerState: importerStatus?.importerState,
		siteSlug,
		siteTitle,
	} ).substack;

	const showExportDataHint =
		importerStatus?.importerState !== appStates.MAP_AUTHORS &&
		importerStatus?.importerState !== appStates.IMPORTING &&
		importerStatus?.importerState !== appStates.IMPORT_SUCCESS;

	return (
		<Card>
			<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />

			{ showExportDataHint && (
				<ContentDataHint selectedSiteUrl={ selectedSite.URL } fromSite={ fromSite } />
			) }
			{ importerStatus && (
				<FileImporter
					site={ selectedSite }
					importerStatus={ importerStatus }
					importerData={ importerData }
					fromSite={ fromSite }
					onContinue={ onContinue }
					nextStepUrl={ nextStepUrl }
					skipNextStep={ skipNextStep }
					invalidateCardData={ invalidateCardData }
				/>
			) }
		</Card>
	);
}
