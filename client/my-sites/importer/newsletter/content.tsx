import { Card, Button, Gridicon } from '@automattic/components';
import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import { useEffect } from 'react';
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
	selectedSite?: SiteDetails;
	siteSlug: string;
	fromSite: QueryArgParsed;
	content: any;
	skipNextStep: () => void;
};

export default function Content( {
	nextStepUrl,
	selectedSite,
	siteSlug,
	fromSite,
	skipNextStep,
}: ContentProps ) {
	const siteTitle = selectedSite?.title;
	const siteId = selectedSite?.ID;

	const siteImports = useSelector( ( state ) => getImporterStatusForSiteId( state, siteId ) );

	const dispatch = useDispatch();
	function fetchImporters() {
		siteId && dispatch( fetchImporterState( siteId ) );
	}

	useEffect( fetchImporters, [ siteId, dispatch ] );
	useEffect( startImporting, [ siteId, dispatch, siteImports ] );

	if ( ! selectedSite ) {
		return null;
	}

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

	return (
		<Card>
			<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />

			{ importerStatus?.importerState !== appStates.MAP_AUTHORS && (
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
					>
						Export content <Gridicon icon="external" />
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
					fromSite={ fromSite as string }
					nextStepUrl={ nextStepUrl }
					skipNextStep={ skipNextStep }
				/>
			) }
		</Card>
	);
}
