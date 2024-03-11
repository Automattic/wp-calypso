import { StepContainer, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect, useState } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import ScanningStep from 'calypso/blocks/import/scanning';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: UrlData ) => void;
}

export const Analyzer: FC< Props > = ( props ) => {
	const translate = useTranslate();
	const { onComplete } = props;
	const [ siteURL, setSiteURL ] = useState< string >( '' );

	const {
		data: siteInfo,
		isError: hasError,
		isFetching,
		isFetched,
	} = useAnalyzeUrlQuery( siteURL, siteURL !== '' );

	useEffect( () => {
		if ( siteInfo ) {
			onComplete( siteInfo );
		}
	}, [ onComplete, siteInfo ] );

	if ( isFetching || ( isFetched && ! hasError ) ) {
		return <ScanningStep />;
	}

	return (
		<div>
			<div className="import__heading import__heading-center">
				<Title>{ translate( 'Where will you import from?' ) }</Title>
			</div>
			<div className="import__capture-container">
				<CaptureInput
					onInputEnter={ setSiteURL }
					onInputChange={ () => setSiteURL( '' ) }
					hasError={ hasError }
					skipInitialChecking
				/>
			</div>
		</div>
	);
};

const SiteMigrationIdentify: Step = function ( { navigation } ) {
	return (
		<>
			<DocumentHead title="Site migration instructions" />
			<StepContainer
				stepName="site-migration-identify"
				flowName="site-migration"
				className="import__onboarding-page"
				hideSkip={ true }
				hideFormattedHeader={ true }
				goBack={ navigation.goBack }
				goNext={ navigation?.submit }
				isFullLayout={ true }
				stepContent={
					<Analyzer
						onComplete={ ( { platform, url } ) =>
							navigation?.submit?.( { platform: platform, from: url } )
						}
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationIdentify;
