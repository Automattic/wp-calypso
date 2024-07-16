import { Card, Button } from '@automattic/components';
import { useEffect } from 'react';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import SubstackImporter from 'calypso/my-sites/importer/importer-substack';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchImporterState, startImport } from 'calypso/state/imports/actions';
import { getImporterStatusForSiteId } from 'calypso/state/imports/selectors';
import type { SiteDetails } from '@automattic/data-stores';
type Props = {
	nextStepUrl: string;
	selectedSite: null | SiteDetails;
	siteSlug: string;
	newsletterUrl?: string;
};

export default function Content( { nextStepUrl, selectedSite, siteSlug, newsletterUrl }: Props ) {
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

	return (
		<Card>
			<Interval onTick={ fetchImporters } period={ EVERY_FIVE_SECONDS } />
			<h2>Step 1: Export your content from Substack</h2>
			<p>
				To generate a ZIP file of all your Substack posts, go to Settings { '>' } Exports and click
				'Create a new export.' Once the ZIP file is downloaded, upload it in the next step.
			</p>
			<Button href={ `https://${ newsletterUrl }/publish/settings#exports` }>Export content</Button>
			<hr />
			<h2>Step 2: Import your content to WordPress.com</h2>
			{ importerStatus && (
				<SubstackImporter
					site={ selectedSite }
					siteSlug={ siteSlug }
					siteTitle={ siteTitle }
					importerStatus={ importerStatus }
				/>
			) }
			<Button href={ nextStepUrl } primary>
				Continue
			</Button>{ ' ' }
			<Button href={ nextStepUrl }>Skip for now</Button>
		</Card>
	);
}
