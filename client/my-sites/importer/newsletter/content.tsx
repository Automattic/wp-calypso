import { Card } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { external } from '@wordpress/icons';
import { useEffect, Dispatch, SetStateAction } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchImporterState, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { getImporterStatusForSiteId } from 'calypso/state/imports/selectors';
import FileImporter from './content-upload/file-importer';
import type { SiteDetails } from '@automattic/data-stores';

type ContentProps = {
	nextStepUrl: string;
	engine: string;
	selectedSite: SiteDetails;
	siteSlug: string;
	fromSite: string;
	skipNextStep: () => void;
	setAutoFetchData: Dispatch< SetStateAction< boolean > >;
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

	const showStepDescriptions =
		importerStatus?.importerState !== appStates.MAP_AUTHORS || importerStatus?.summaryModalOpen;

	return (
		<Card>
			<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />

			{ showStepDescriptions && (
				<>
					<h2>Step 1: Export your content from Substack</h2>
					<p>
						To generate a ZIP file of all your Substack posts, go to Settings { '>' } Exports and
						click 'Create a new export.' Once the ZIP file is downloaded, upload it in the next
						step.
					</p>
					<Button
						href={ `https://${ fromSite }/publish/settings?search=export` }
						target="_blank"
						rel="noreferrer noopener"
						icon={ external }
						variant="primary"
					>
						Open Substack settings
					</Button>
					<hr />
					<h2>Step 2: Import your content to WordPress.com</h2>
				</>
			) }
			{ importerStatus && (
				<FileImporter
					site={ selectedSite }
					importerStatus={ importerStatus }
					importerData={ importerData }
					fromSite={ fromSite }
					nextStepUrl={ nextStepUrl }
					skipNextStep={ skipNextStep }
					invalidateCardData={ invalidateCardData }
				/>
			) }
		</Card>
	);
}
