import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { convertPlatformName } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { Step as StepType } from '../../types';
import { ImportPlatformForwarder } from './components/importer-forwarding-details';
import './style.scss';

export const Scanning = () => {
	return (
		<div className="site-migration-other-platform__scanning">
			<LoadingEllipsis />
		</div>
	);
};

const SiteMigrationOtherPlatform: StepType< {
	submits:
		| {
				action: 'import' | 'skip';
				platform?: ImporterPlatform | null;
		  }
		| undefined;
} > = function ( { navigation } ) {
	const translate = useTranslate();
	const [ query ] = useSearchParams();
	const from = query.get( 'from' ) as string;

	const [ platform, setPlatform ] = useState< ImporterPlatform | null >(
		query.get( 'platform' ) as ImporterPlatform | null
	);

	const shouldAnalyzeUrl = platform === null;

	const {
		isFetching: isAnalyzingUrl,
		data: siteInfo,
		isSuccess,
	} = useAnalyzeUrlQuery( from, shouldAnalyzeUrl );

	const platformName = convertPlatformName( platform as ImporterPlatform ) || '';

	useEffect( () => {
		if ( ! isSuccess || ! siteInfo ) {
			return;
		}
		setPlatform( siteInfo.platform );
	}, [ siteInfo, isSuccess, platform ] );

	const handleSubmit = useCallback( () => {
		navigation.submit?.( {
			action: 'import',
			platform: platform,
		} );
	}, [ navigation, platform ] );

	const handleHelp = useCallback( () => {
		navigation.submit?.( {
			action: 'skip',
		} );
	}, [ navigation ] );

	const descriptionWithPlatform = translate(
		// translators: platform is the name of the platform importer we are supporting.
		"Our migration service is for WordPress sites. But don't worry — our {{strong}}%(platform)s{{/strong}} import tool is ready to bring your content to WordPress.com.",
		{
			args: {
				platform: platformName || '',
			},
			components: {
				strong: <strong />,
			},
		}
	);

	const descriptionWithoutPlatform = translate(
		"Our migration service is for WordPress sites. We don't currently support importing from this platform."
	);

	const title = translate( "Looks like there's been a mix-up" );
	const description =
		platformName === 'Unknown' ? descriptionWithoutPlatform : descriptionWithPlatform;

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						leftElement={
							navigation?.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
					/>
				}
				heading={ <Step.Heading text={ title } subText={ description } /> }
			>
				{ isAnalyzingUrl ? (
					<Scanning />
				) : (
					<ImportPlatformForwarder
						platformName={ platformName }
						onSubmit={ handleSubmit }
						onHelp={ handleHelp }
					/>
				) }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationOtherPlatform;
