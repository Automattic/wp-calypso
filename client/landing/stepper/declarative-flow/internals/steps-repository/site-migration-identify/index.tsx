import { StepContainer, Title, SubTitle, HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect, useState, useCallback } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import ScanningStep from 'calypso/blocks/import/scanning';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: UrlData ) => void;
	onSkip: () => void;
}

export const Analyzer: FC< Props > = ( { onComplete, onSkip } ) => {
	const translate = useTranslate();
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
				<Title>{ translate( 'Let’s import your content' ) }</Title>
				<SubTitle>{ translate( 'Drop your current site address below to get started.' ) }</SubTitle>
			</div>
			<div className="import__capture-container">
				<CaptureInput
					onInputEnter={ setSiteURL }
					onInputChange={ () => setSiteURL( '' ) }
					hasError={ hasError }
					skipInitialChecking
					onDontHaveSiteAddressClick={ onSkip }
					placeholder={ translate( 'mygreatnewblog.com' ) }
					label={ translate( 'Enter your site address:' ) }
					dontHaveSiteAddressLabel={ translate(
						'Or <button>pick your current platform from a list</button>'
					) }
				/>
			</div>
		</div>
	);
};

export type SiteMigrationIdentifyAction = 'continue' | 'skip_platform_identification';

const saveSiteSettings = async ( siteSlug: string, settings: Record< string, unknown > ) => {
	return wpcom.req.post(
		`/sites/${ siteSlug }/settings`,
		{
			apiVersion: '1.4',
		},
		{
			...settings,
		}
	);
};

const SiteMigrationIdentify: Step = function ( { navigation, variantSlug } ) {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();

	const handleSubmit = useCallback(
		async ( action: SiteMigrationIdentifyAction, data?: { platform: string; from: string } ) => {
			// If we have a site and URL, and we're coming from a WordPress site,
			// record the migration source domain.
			if ( siteSlug && 'wordpress' === data?.platform && data?.from ) {
				await saveSiteSettings( siteSlug, { migration_source_site_domain: data.from } );
			}

			navigation?.submit?.( { action, ...data } );
		},
		[ navigation, siteSlug ]
	);

	const urlQueryParams = useQuery();

	const shouldHideBackButton = () => {
		const ref = urlQueryParams.get( 'ref' ) || '';
		const shouldHideBasedOnRef = [ 'entrepreneur-signup', 'calypso-importer' ].includes( ref );
		const shouldHideBasedOnVariant = [ HOSTED_SITE_MIGRATION_FLOW ].includes( variantSlug || '' );

		return shouldHideBasedOnRef || shouldHideBasedOnVariant;
	};

	return (
		<>
			<DocumentHead title={ translate( 'Import your site content' ) } />
			<StepContainer
				stepName="site-migration-identify"
				flowName="site-migration"
				className="import__onboarding-page"
				hideBack={ shouldHideBackButton() }
				hideSkip
				hideFormattedHeader
				goBack={ navigation.goBack }
				goNext={ navigation?.submit }
				isFullLayout
				stepContent={
					<Analyzer
						onComplete={ ( { platform, url } ) =>
							handleSubmit( 'continue', { platform, from: url } )
						}
						onSkip={ () => {
							handleSubmit( 'skip_platform_identification' );
						} }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationIdentify;
