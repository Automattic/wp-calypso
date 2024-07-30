import { StepContainer, Title, SubTitle } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect, useState, useCallback } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';
interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: UrlData ) => void;
}

export const SourceSiteInput: FC< Props > = ( { onComplete } ) => {
	const translate = useTranslate();
	const [ siteURL, setSiteURL ] = useState< string >( '' );

	const title = translate( 'Share your site address' );
	const subtitle = translate(
		"Let's get your migration started. Please share your site address so we can review your site and begin your migration."
	);

	const { data: siteInfo, isError: hasError } = useAnalyzeUrlQuery( siteURL, siteURL !== '' );

	useEffect( () => {
		if ( siteInfo ) {
			onComplete( siteInfo );
		}
	}, [ onComplete, siteInfo ] );

	return (
		<div className="import__capture-wrapper">
			<div className="import__heading import__heading-center">
				<Title>{ title }</Title>
				<SubTitle>{ subtitle }</SubTitle>
			</div>
			<div className="import__capture-container">
				<CaptureInput
					onInputEnter={ setSiteURL }
					onInputChange={ () => setSiteURL( '' ) }
					hasError={ hasError }
					skipInitialChecking
					placeholder={ translate( 'mygreatnewblog.com' ) }
					label={ translate( 'Enter your site address:' ) }
					hideImporterListLink
				/>
			</div>
		</div>
	);
};

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

const SiteMigrationSourceUrl: Step = function ( { navigation } ) {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();

	const handleSubmit = useCallback(
		async ( action: string, data: { from: string } ) => {
			// If we have a site and URL, record the migration source domain.
			if ( siteSlug && data.from ) {
				await saveSiteSettings( siteSlug, { migration_source_site_domain: data.from } );
			}

			navigation?.submit?.( { action, ...data } );
		},
		[ navigation, siteSlug ]
	);

	return (
		<>
			<DocumentHead title={ translate( 'Share your site address' ) } />
			<StepContainer
				stepName="site-migration-identify"
				flowName="site-migration"
				className="import__onboarding-page"
				hideBack
				hideSkip
				hideFormattedHeader
				goNext={ navigation?.submit }
				isFullLayout
				stepContent={
					<SourceSiteInput
						onComplete={ ( { url } ) =>
							handleSubmit( 'skip_platform_identification', { from: url } )
						}
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationSourceUrl;
