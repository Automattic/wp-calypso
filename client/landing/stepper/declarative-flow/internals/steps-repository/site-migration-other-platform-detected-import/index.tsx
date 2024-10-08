import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { Step } from '../../types';
import { ImportPlatformForwarder } from './components/importer-forwarding-details';
import { Scanning } from './components/scanning';

import './style.scss';

const SiteMigrationOtherPlatform: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const [ query ] = useSearchParams();
	const from = query.get( 'from' ) as string;
	const [ platform, setPlatform ] = useState< ImporterPlatform | null >(
		query.get( 'platform' ) as ImporterPlatform | null
	);

	const shouldAnalyzeUrl = platform === null;

	const {
		isFetching: isAnalyzingUrl,
		data: analyzeUrlData,
		isSuccess,
	} = useAnalyzeUrlQuery( from, shouldAnalyzeUrl );

	useEffect( () => {
		if ( ! isSuccess || ! analyzeUrlData ) {
			return;
		}
		setPlatform( analyzeUrlData.platform );
	}, [ analyzeUrlData, isSuccess, platform ] );

	const handleSubmit = useCallback( () => {
		navigation.submit?.( {
			action: 'import',
			platform: platform,
		} );
	}, [ navigation, platform ] );

	const handleSkip = useCallback( () => {
		navigation.submit?.( {
			action: 'skip',
		} );
	}, [ navigation ] );

	return (
		<>
			<DocumentHead title={ translate( "Looks like there's been a mix-up" ) } />
			<StepContainer
				stepName="site-migration-other-platform"
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				hideSkip
				isFullLayout
				formattedHeader={
					isAnalyzingUrl ? (
						<span />
					) : (
						<FormattedHeader
							id="site-migration-credentials-header"
							headerText={ translate( "Looks like there's been a mix-up" ) }
							subHeaderText={ translate(
								'Our migration service is for WordPress sites. But don’t worry — our import tool is ready to bring your content to WordPress.com.'
							) }
							align="center"
							subHeaderAlign="center"
						/>
					)
				}
				stepContent={
					isAnalyzingUrl ? (
						<Scanning
							label={ translate( 'Scanning your site' ) }
							text={ translate( "We'll be done in no time." ) }
						/>
					) : (
						<ImportPlatformForwarder onSubmit={ handleSubmit } onSkip={ handleSkip } />
					)
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationOtherPlatform;
