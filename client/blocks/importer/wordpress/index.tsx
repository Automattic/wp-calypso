import React, { useEffect } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { isJetpackSitePred } from 'calypso/state/sites/selectors';
import { Importer, ImportJob, StepNavigator } from '../types';
import ImportContentOnly from './import-content-only';
import type { SiteDetails } from '@automattic/data-stores';

interface Props {
	job?: ImportJob;
	site?: SiteDetails | null;
	siteId: number;
	siteSlug: string;
	stepNavigator?: StepNavigator;
	renderHeading?: boolean;
}

export const WordpressImporter: React.FunctionComponent< Props > = ( props ) => {
	const importer: Importer = 'wordpress';

	const { job, site: siteItem, siteSlug, stepNavigator, renderHeading } = props;

	const isSiteAtomic = !! siteItem?.options?.is_automated_transfer;
	const isSiteJetpack = isJetpackSitePred()( siteItem ?? null );
	const fromSiteAnalyzedData = useSelector( getUrlData );
	const shouldRedirectToWpAdmin = ! isSiteAtomic && isSiteJetpack;

	/**
	 ↓ Effects
	 */
	useEffect( () => {
		if ( shouldRedirectToWpAdmin ) {
			stepNavigator?.goToWpAdminImportPage?.();
		}
	}, [ shouldRedirectToWpAdmin, stepNavigator ] );

	/**
	 ↓ HTML
	 */
	return (
		<>
			{ ( () => {
				if ( shouldRedirectToWpAdmin ) {
					return (
						<div className="import-layout__center">
							<LoadingEllipsis />
						</div>
					);
				}

				return (
					<ImportContentOnly
						job={ job }
						importer={ importer }
						siteItem={ siteItem }
						siteSlug={ siteSlug }
						siteAnalyzedData={ fromSiteAnalyzedData }
						stepNavigator={ stepNavigator }
						renderHeading={ renderHeading }
					/>
				);
			} )() }
		</>
	);
};

export default WordpressImporter;
