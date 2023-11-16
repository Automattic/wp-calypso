import React from 'react';
import { ReadyStep } from 'calypso/blocks/import/ready';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { ImportWrapper } from '../import';
import { BASE_ROUTE } from '../import/config';
import { getFinalImporterUrl } from '../import/helper';
import './style.scss';

const ImportReady: Step = function ImportStep( props ) {
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
	const goToImporterPage = () => {
		const url = getFinalImporterUrl(
			siteSlug as string,
			urlData.url,
			urlData.platform,
			isAtomicSite
		);

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
