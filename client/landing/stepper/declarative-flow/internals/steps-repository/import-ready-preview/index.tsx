import { useSelect } from '@wordpress/data';
import React, { useCallback, useEffect } from 'react';
import { ReadyPreviewStep } from 'calypso/blocks/import/ready';
import ScanningStep from 'calypso/blocks/import/scanning';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ImportWrapper } from '../import';
import { BASE_ROUTE } from '../import/config';
import { getFinalImporterUrl } from '../import/helper';
import type { OnboardSelect } from '@automattic/data-stores';

const ImportReadyPreview: Step = function ImportStep( props ) {
	const { navigation } = props;
	const siteSlug = useSiteSlugParam();
	const fromUrl = useQuery().get( 'from' ) || '';
	const { data: urlData, isFetched, isFetching } = useAnalyzeUrlQuery( fromUrl );
	const isMigrateFromWp = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
		[]
	);

	/**
	 ↓ Methods
	 */
	const goToHomeStep = useCallback( () => {
		navigation.goToStep?.( BASE_ROUTE );
	}, [ navigation ] );

	const goToImporterPage = useCallback( () => {
		if ( ! urlData ) {
			return;
		}

		const url = getFinalImporterUrl( siteSlug as string, urlData.url, urlData.platform );
		navigation.submit?.( { url } );
	}, [ urlData, siteSlug, navigation ] );

	/**
	 ↓ Effects
	 */
	// redirect to home step if urlData is not available
	useEffect( () => {
		isFetched && ! urlData && goToHomeStep();
	}, [ isFetched, urlData ] );

	// redirect directly to importer page
	useEffect( () => {
		( isMigrateFromWp || urlData?.platform === 'wordpress' ) && goToImporterPage();
	}, [ urlData, isMigrateFromWp ] );

	/**
	 ↓ Renders
	 */
	return (
		<ImportWrapper { ...props }>
			{ isFetching && <ScanningStep /> }

			{ ! isFetching && urlData && (
				<ReadyPreviewStep
					urlData={ urlData }
					siteSlug={ siteSlug as string }
					goToImporterPage={ goToImporterPage }
					recordTracksEvent={ recordTracksEvent }
				/>
			) }
		</ImportWrapper>
	);
};

export default ImportReadyPreview;
