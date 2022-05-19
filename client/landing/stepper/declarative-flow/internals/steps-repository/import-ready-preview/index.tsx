import React from 'react';
import { useSelector } from 'react-redux';
import { ReadyPreviewStep } from 'calypso/blocks/import/ready';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { ImportWrapper } from '../import';
import { BASE_ROUTE } from '../import/config';
import { getFinalImporterUrl } from '../import/helper';
import './style.scss';

const ImportReadyPreview: Step = function ImportStep( props ) {
	const { navigation } = props;
	const siteSlug = useSiteSlugParam();
	const site = useSite();
	const isAtomicSite = !! site?.options?.is_automated_transfer;
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
	function goToImporterPage() {
		const url = getFinalImporterUrl(
			siteSlug as string,
			urlData.url,
			urlData.platform,
			isAtomicSite,
			'stepper'
		);

		navigation.submit?.( { url } );
	}

	function goToHomeStep() {
		navigation.goToStep?.( BASE_ROUTE );
	}

	/**
	 ↓ Renders
	 */
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
