import React from 'react';
import { ReadyStep } from 'calypso/blocks/import/ready';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { ImportWrapper } from '../import';
import { BASE_ROUTE } from '../import/config';
import { getFinalImporterUrl } from '../import/helper';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const ImportReady: Step< { submits: { platform: ImporterPlatform; url: string } } > =
	function ImportStep( props ) {
		const { navigation } = props;
		const siteSlug = useSiteSlugParam();
		const urlData = useSelector( getUrlData );

		/**
		 ↓ Effects
		 */
		if ( ! urlData ) {
			goToHomeStep();
			return null;
		}

		/**
		 ↓ Methods
		 */
		const goToImporterPage = () => {
			const url = getFinalImporterUrl( siteSlug as string, urlData.url, urlData.platform );

			navigation.submit?.( { url, platform: urlData.platform } );
		};

		function goToHomeStep() {
			navigation.goToStep?.( BASE_ROUTE );
		}

		/**
		 ↓ Renders
		 */
		return (
			<ImportWrapper { ...props } stepName="ready">
				<ReadyStep
					platform={ urlData?.platform }
					goToImporterPage={ goToImporterPage }
					recordTracksEvent={ recordTracksEvent }
					fromSite={ urlData?.url }
				/>
			</ImportWrapper>
		);
	};

export default ImportReady;
