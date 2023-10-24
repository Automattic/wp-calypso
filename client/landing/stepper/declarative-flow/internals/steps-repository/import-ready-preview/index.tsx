import { useSelect } from '@wordpress/data';
import React, { useEffect } from 'react';
import { ReadyPreviewStep } from 'calypso/blocks/import/ready';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { ImportWrapper } from '../import';
import { BASE_ROUTE } from '../import/config';
import { getFinalImporterUrl } from '../import/helper';
import type { OnboardSelect } from '@automattic/data-stores';

import './style.scss';

const ImportReadyPreview: Step = function ImportStep( props ) {
	const { navigation } = props;
	const siteSlug = useSiteSlugParam();
	const site = useSite();
	const isAtomicSite = !! site?.options?.is_automated_transfer;
	const urlData = useSelector( getUrlData );
	const isMigrateFromWp = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
		[]
	);

	/**
	 ↓ Effects
	 */
	// redirect to home step if urlData is not available
	useEffect( () => {
		! urlData && goToHomeStep();
	}, [ urlData, navigation ] );

	// redirect directly to importer page
	useEffect( () => {
		if ( ! urlData ) {
			return;
		}

		if ( isMigrateFromWp || urlData.platform === 'wordpress' ) {
			goToImporterPage();
		}
	}, [ urlData, isMigrateFromWp ] );

	/**
	 ↓ Methods
	 */
	function goToImporterPage() {
		if ( ! urlData ) {
			return;
		}

		const url = getFinalImporterUrl(
			siteSlug as string,
			urlData.url,
			urlData.platform,
			isAtomicSite
		);

		navigation.submit?.( { url } );
	}

	function goToHomeStep() {
		navigation.goToStep?.( BASE_ROUTE );
	}

	/**
	 ↓ Renders
	 */
	if ( ! urlData ) {
		return null;
	}

	return (
		<ImportWrapper { ...props }>
			<ReadyPreviewStep
				urlData={ urlData }
				siteSlug={ siteSlug as string }
				goToImporterPage={ goToImporterPage }
				recordTracksEvent={ recordTracksEvent }
			/>
		</ImportWrapper>
	);
};

export default ImportReadyPreview;
