import { formatNumber } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { next, published, shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect, useState, useCallback } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import ScanningStep from 'calypso/blocks/import/scanning';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { urlToDomain } from 'calypso/lib/url';
import { ChecklistCard } from '../../components/checklist-card';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import type { Step as StepType } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: UrlData, hostingProviderSlug?: string ) => void;
	onSkip: () => void;
	hideImporterListLink: boolean;
	flowName: string;
	onVisibilityChange: ( isVisible: boolean ) => void;
}

export const Analyzer: FC< Props > = ( {
	onComplete,
	onSkip,
	onVisibilityChange,
	hideImporterListLink = false,
} ) => {
	const translate = useTranslate();
	const [ siteURL, setSiteURL ] = useState< string >( '' );
	const {
		data: siteInfo,
		isError: hasError,
		isFetching,
		isFetched,
	} = useAnalyzeUrlQuery( siteURL, siteURL !== '' );

	// Fetch hosting provider after we get site info
	const domain = siteInfo ? urlToDomain( siteInfo.url ) : '';
	const {
		data: hostingProviderData,
		isFetching: isFetchingHosting,
		isError: hasHostingError,
	} = useHostingProviderQuery( domain, !! domain );

	// Update loading state to include hosting check
	const isScanning =
		isFetching ||
		isFetchingHosting ||
		( isFetched && ! hasError && ! hostingProviderData && ! hasHostingError );

	useEffect( () => {
		// Only complete when we have both site info AND hosting info (or hosting check failed)
		if ( siteInfo && ( hostingProviderData || hasHostingError ) ) {
			onComplete( siteInfo, hostingProviderData?.hosting_provider?.slug );
		}
	}, [ onComplete, siteInfo, hostingProviderData, hasHostingError ] );

	useEffect( () => {
		onVisibilityChange?.( ! isScanning );
	}, [ isScanning, onVisibilityChange ] );

	if ( isScanning ) {
		return <ScanningStep />;
	}

	const hostingDetailItems = [
		{
			icon: next,
			text: translate(
				'Blazing fast speeds with lightning-fast load times for a seamless experience.'
			),
		},
		{
			icon: published,
			text: translate(
				'Unmatched reliability with %(uptimePercent)s uptime and unmetered traffic.',
				{
					args: {
						uptimePercent: formatNumber( 0.99999, {
							numberFormatOptions: { style: 'percent', maximumFractionDigits: 3 },
						} ),
					},
					comment: '99.999% uptime',
				}
			),
		},
		{
			icon: shield,
			text: translate( 'Round-the-clock security monitoring and DDoS protection.' ),
		},
	];

	return (
		<>
			<div className="import__capture-container">
				<CaptureInput
					onInputEnter={ setSiteURL }
					onInputChange={ () => setSiteURL( '' ) }
					hasError={ hasError }
					skipInitialChecking
					onDontHaveSiteAddressClick={ onSkip }
					placeholder={ translate( 'mygreatnewblog.com' ) }
					label={ translate( 'Site address' ) }
					dontHaveSiteAddressLabel={ translate(
						'Or <button>pick your current platform from a list</button>'
					) }
					hideImporterListLink={ hideImporterListLink }
					nextLabelText={ translate( 'Check my site' ) }
				/>
			</div>
			<ChecklistCard
				title={ translate( 'Why should you host with us?' ) }
				items={ hostingDetailItems }
			/>
		</>
	);
};

export type SiteMigrationIdentifyAction = 'continue' | 'skip_platform_identification';

const SiteMigrationIdentify: StepType< {
	submits:
		| {
				action: SiteMigrationIdentifyAction;
				platform?: string;
				from?: string;
				host?: string;
		  }
		| undefined;
} > = function ( { navigation, flow } ) {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { createScreenshots } = useSitePreviewMShotImageHandler();

	const handleSubmit = useCallback(
		async (
			action: SiteMigrationIdentifyAction,
			data?: { platform: string; from: string; host?: string }
		) => {
			// If we have a URL of the source, we send requests to the mShots API to create screenshots
			// early in the flow to avoid long loading times in the migration instructions step.
			// Because mShots API can often take a long time to generate screenshots.
			if ( data?.from ) {
				createScreenshots( data?.from );
			}

			navigation?.submit?.( { action, ...data } );
		},
		[ navigation, siteSlug, createScreenshots ]
	);

	const urlQueryParams = useQuery();

	const [ isVisible, setIsVisible ] = useState( false );

	const stepContent = (
		<Analyzer
			onComplete={ ( { platform, url }, hostingProviderSlug ) =>
				handleSubmit( 'continue', { platform, from: url, host: hostingProviderSlug } )
			}
			hideImporterListLink={ urlQueryParams.get( 'hide_importer_link' ) === 'true' }
			onSkip={ () => {
				handleSubmit( 'skip_platform_identification' );
			} }
			flowName={ flow }
			onVisibilityChange={ ( isVisible ) => {
				setIsVisible( isVisible );
			} }
		/>
	);

	return (
		<>
			<DocumentHead title={ translate( 'Import your site content' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-identify"
				columnWidth={ 4 }
				topBar={
					<Step.TopBar
						leftElement={
							navigation?.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
					/>
				}
				heading={
					isVisible ? (
						<Step.Heading
							text={ translate( "Let's find your site" ) }
							subText={ translate( 'Enter your current site address below to get started.' ) }
						/>
					) : undefined
				}
			>
				{ stepContent }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationIdentify;
