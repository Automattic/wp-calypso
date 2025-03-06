import { Card } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { useEffect } from 'react';
import exportSubstackDataImg from 'calypso/assets/images/importer/export-substack-content.png';
import importerConfig from 'calypso/lib/importer/importer-config';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchImporterState, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { getImporterStatusForSiteId } from 'calypso/state/imports/selectors';
import FileImporter from './content-upload/file-importer';
import { EngineTypes } from './types';
import { normalizeFromSite } from './utils';
import type { SiteDetails } from '@automattic/data-stores';

interface ContentProps {
	nextStepUrl: string;
	engine: EngineTypes;
	selectedSite: SiteDetails;
	siteSlug: string;
	fromSite: string;
	skipNextStep: () => void;
}

export default function Content( {
	nextStepUrl,
	engine,
	selectedSite,
	siteSlug,
	fromSite,
	skipNextStep,
}: ContentProps ) {
	const { __ } = useI18n();
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

	const normalizedFromSite = normalizeFromSite( fromSite );
	const baseUrl = normalizedFromSite.startsWith( 'http' )
		? normalizedFromSite
		: `https://${ normalizedFromSite }`;

	const settingsUrl = `${
		baseUrl.endsWith( '/' ) ? baseUrl.slice( 0, -1 ) : baseUrl
	}/publish/settings?search=export`;

	return (
		<Card>
			<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />

			{ showExportDataHint && (
				<>
					<h2>{ __( 'Step 1: Export your content from Substack' ) }</h2>
					<p>
						{ createInterpolateElement(
							__(
								'Generate a ZIP file of all your Substack posts. On Substack, go to Settings > Exports, click <strong>New export</strong>, and upload the downloaded ZIP file in the next step.'
							),
							{
								strong: <strong />,
							}
						) }
					</p>
					<img
						src={ exportSubstackDataImg }
						alt={ __( 'Export Substack data' ) }
						className="export-content"
					/>
					<Button
						href={ settingsUrl }
						target="_blank"
						rel="noreferrer noopener"
						icon={ external }
						iconPosition="right"
						variant="primary"
					>
						{ __( 'Open Substack settings' ) }
					</Button>
					<hr />
					<h2>{ __( 'Step 2: Import your content to WordPress.com' ) }</h2>
					<p>
						{ i18n.fixMe( {
							text: 'Your posts may be added to your homepage by default. If you prefer your posts to load on a separate page, first go to Reading Settings, and change "Your homepage displays" to a static page.',
							newCopy: createInterpolateElement(
								__(
									'Your posts may be added to your homepage by default. If you prefer your posts to load on a separate page, first go to <a>Reading Settings</a>, and change "Your homepage displays" to a static page.'
								),
								{
									a: (
										<a
											href={ `${ selectedSite.URL }/wp-admin/options-reading.php` }
											target="_blank"
											rel="noreferrer noopener"
										/>
									),
								}
							),
							oldCopy: __( '' ),
						} ) }
					</p>
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
