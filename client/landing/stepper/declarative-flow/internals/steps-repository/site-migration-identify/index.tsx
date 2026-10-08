import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { formatNumber } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { Notice, ProgressBar, Spinner } from '@wordpress/components';
import { next, published, shield } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect, useState, useCallback, useRef } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import ScanningStep from 'calypso/blocks/import/scanning';
import { convertPlatformName } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { urlToDomain } from 'calypso/lib/url';
import { ChecklistCard } from '../../components/checklist-card';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import warningIcon from './warning.svg';
import type { Step as StepType } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

type ConnectionIssue = 'unreachable' | 'http';

interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: UrlData, hostingProviderSlug?: string ) => void;
	onSkip: () => void;
	hideImporterListLink: boolean;
	flowName: string;
	onVisibilityChange: ( isVisible: boolean, issue?: ConnectionIssue ) => void;
	isReprintFlow?: boolean;
	siteURL: string;
	onSiteURLChange: ( url: string ) => void;
}

export const Analyzer: FC< Props > = ( {
	onComplete,
	onSkip,
	onVisibilityChange,
	hideImporterListLink = false,
	isReprintFlow = false,
	siteURL,
	onSiteURLChange,
} ) => {
	const translate = useTranslate();
	const onCompleteRef = useRef( onComplete );
	onCompleteRef.current = onComplete;
	const {
		data: siteInfo,
		isError: hasError,
		isFetching,
		isFetched,
		refetch,
		error,
	} = useAnalyzeUrlQuery( siteURL, siteURL !== '' );

	const errorHealth =
		error &&
		'data' in error &&
		error.data &&
		typeof error.data === 'object' &&
		'site_health' in error.data
			? error.data.site_health
			: undefined;
	const siteHealth = hasError ? errorHealth : siteInfo?.site_health;
	let connectionIssue: ConnectionIssue | undefined;
	if ( isReprintFlow && siteURL && ! isFetching ) {
		if (
			( typeof siteHealth === 'string' && siteHealth !== 'ok' ) ||
			( hasError && error && 'code' in error && error.code === 'http_request_failed' )
		) {
			connectionIssue = 'unreachable';
		} else if ( ! hasError && siteInfo && getUrlParts( siteInfo.url ).protocol === 'http:' ) {
			connectionIssue = 'http';
		}
	}

	// Fetch hosting provider after we get site info
	const domain = siteInfo && ! connectionIssue ? urlToDomain( siteInfo.url ) : '';
	const {
		data: hostingProviderData,
		isFetching: isFetchingHosting,
		isError: hasHostingError,
	} = useHostingProviderQuery( domain, !! domain );

	// Update loading state to include hosting check
	const isScanning =
		! connectionIssue &&
		( isFetching ||
			isFetchingHosting ||
			( isFetched && ! hasError && ! hostingProviderData && ! hasHostingError ) );

	useEffect( () => {
		// Only complete when we have both site info AND hosting info (or hosting check failed)
		if (
			siteURL &&
			siteInfo &&
			! connectionIssue &&
			! hasError &&
			! isFetching &&
			! isFetchingHosting &&
			( hostingProviderData || hasHostingError )
		) {
			onCompleteRef.current( siteInfo, hostingProviderData?.hosting_provider?.slug );
		}
	}, [
		siteURL,
		siteInfo,
		hostingProviderData,
		hasHostingError,
		hasError,
		isFetching,
		isFetchingHosting,
		connectionIssue,
	] );

	useEffect( () => {
		onVisibilityChange?.( ! isScanning, connectionIssue );
	}, [ isScanning, connectionIssue, onVisibilityChange ] );

	if ( isScanning && ! isReprintFlow ) {
		return <ScanningStep />;
	}

	const enteredURL = /^https?:\/\//i.test( siteURL ) ? siteURL : `https://${ siteURL }`;
	const sourceURL = ! hasError && siteInfo ? siteInfo.url : enteredURL;
	const { hostname } = getUrlParts( sourceURL );
	const platformName =
		siteInfo?.platform && siteInfo.platform !== 'unknown'
			? convertPlatformName( siteInfo.platform )
			: undefined;
	const hasIdentifiedPlatform = !! siteInfo && ! isFetching;
	const checkStatus = hasIdentifiedPlatform
		? translate( 'Checking your hosting provider' )
		: translate( 'Identifying your site platform' );

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
			{ isReprintFlow && ( isScanning || connectionIssue ) && (
				<div className="site-migration-identify__checking">
					<div className="site-migration-identify__summary">
						<span>{ hostname }</span>
						<Step.LinkButton href={ sourceURL } target="_blank" rel="noopener noreferrer">
							{ platformName
								? translate( '%(platform)s site ↗', { args: { platform: platformName } } )
								: translate( 'View site ↗' ) }
						</Step.LinkButton>
					</div>
					{ connectionIssue ? (
						<div className="site-migration-identify__status site-migration-identify__connection-issue">
							<Notice status="warning" isDismissible={ false }>
								<img src={ warningIcon } alt="" width={ 24 } height={ 24 } />
								<span>
									{ connectionIssue === 'http'
										? translate( '%(site)s uses plain HTTP', { args: { site: hostname } } )
										: translate( 'Couldn’t connect' ) }
								</span>
							</Notice>
							<p>
								{ connectionIssue === 'http'
									? translate(
											'Turn on HTTPS at your host, most offer it free, then try again. If you typed http:// by mistake and the site redirects to https, we pick that up on our own.'
										)
									: translate(
											'Check the address and try again. If your site is down, our team can take a look and help you migrate it once it’s back.'
										) }
							</p>
							<div className="site-migration-identify__actions">
								<Step.PrimaryButton onClick={ () => refetch() }>
									{ translate( 'Try again' ) }
								</Step.PrimaryButton>
								{ connectionIssue === 'http' && (
									<Step.SecondaryButton disabled>
										{ translate( 'How to enable HTTPS ↗' ) }
									</Step.SecondaryButton>
								) }
							</div>
							<Step.LinkButton disabled>{ translate( 'Talk to the team' ) }</Step.LinkButton>
						</div>
					) : (
						<div className="site-migration-identify__status" role="status" aria-live="polite">
							<div className="site-migration-identify__status-title">
								<span className="site-migration-identify__spinner">
									<Spinner />
								</span>
								<span>{ checkStatus }</span>
							</div>
							<div className="site-migration-identify__progress">
								<div>
									<ProgressBar
										className="site-migration-identify__progress-bar"
										value={ hasIdentifiedPlatform ? 100 : undefined }
										aria-label={ translate( 'Site platform' ) }
									/>
									<span>{ translate( 'Site platform' ) }</span>
								</div>
								<div>
									<ProgressBar
										className="site-migration-identify__progress-bar"
										value={ hasIdentifiedPlatform ? undefined : 0 }
										aria-label={ translate( 'Hosting provider' ) }
									/>
									<span>{ translate( 'Hosting provider' ) }</span>
								</div>
							</div>
							<p>
								{ translate( 'We’re looking at %(site)s to see what we can copy.', {
									args: { site: hostname },
								} ) }
							</p>
						</div>
					) }
				</div>
			) }
			<div
				className="import__capture-container"
				hidden={ isReprintFlow && ( isScanning || !! connectionIssue ) }
			>
				<CaptureInput
					onInputEnter={ ( url ) => {
						if ( isReprintFlow && url === siteURL ) {
							refetch();
						} else {
							onSiteURLChange( url );
						}
					} }
					onInputChange={ () => onSiteURLChange( '' ) }
					hasError={ hasError }
					skipInitialChecking
					onDontHaveSiteAddressClick={ onSkip }
					placeholder={ translate( 'mygreatnewblog.com' ) }
					label={ translate( 'Site address' ) }
					dontHaveSiteAddressLabel={
						isReprintFlow
							? translate( '<button>Only have a backup file? Our team will help you</button>' )
							: translate( 'Or <button>pick your current platform from a list</button>' )
					}
					hideImporterListLink={ ! isReprintFlow && hideImporterListLink }
					nextLabelText={ isReprintFlow ? translate( 'Continue' ) : translate( 'Check my site' ) }
				/>
			</div>
			{ ! isReprintFlow && (
				<ChecklistCard
					title={ translate( 'Why should you host with us?' ) }
					items={ hostingDetailItems }
				/>
			) }
		</>
	);
};

export type SiteMigrationIdentifyAction =
	'continue' | 'skip_platform_identification' | 'backup_file';

const SiteMigrationIdentify: StepType< {
	submits:
		| {
				action: SiteMigrationIdentifyAction;
				platform?: string;
				from?: string;
				host?: string;
				isWpcom?: boolean;
		  }
		| undefined;
} > = function ( { navigation, flow } ) {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const isReprintFlow = config.isEnabled( 'migration/reprint-flow' );
	const { createScreenshots } = useSitePreviewMShotImageHandler();

	const handleSubmit = useCallback(
		async (
			action: SiteMigrationIdentifyAction,
			data?: { platform: string; from: string; host?: string; isWpcom?: boolean }
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

	const [ isVisible, setIsVisible ] = useState( true );
	const [ connectionIssue, setConnectionIssue ] = useState< ConnectionIssue >();
	const [ siteURL, setSiteURL ] = useState( '' );
	const isChecking = isReprintFlow && ! isVisible;
	const goBack = isChecking || connectionIssue ? () => setSiteURL( '' ) : navigation?.goBack;
	let title = isChecking ? translate( 'Checking your site' ) : translate( "Let's find your site" );
	let subTitle = isChecking
		? undefined
		: translate( 'Enter your current site address below to get started.' );
	if ( connectionIssue === 'http' ) {
		title = translate( 'Your site isn’t on HTTPS' );
		subTitle = translate(
			'We only migrate sites over a secure connection, so nothing is sent unencrypted. Nothing has changed on your site.'
		);
	} else if ( connectionIssue === 'unreachable' ) {
		title = translate( 'We couldn’t reach your site' );
		subTitle = translate(
			'It may be offline, behind a login, or blocking automated visitors. Nothing has changed on your site.'
		);
	}

	const stepContent = (
		<Analyzer
			onComplete={ ( { platform, url, platform_data }, hostingProviderSlug ) =>
				handleSubmit( 'continue', {
					platform,
					from: url,
					host: hostingProviderSlug,
					...( isReprintFlow && platform_data?.is_wpcom ? { isWpcom: true } : {} ),
				} )
			}
			hideImporterListLink={ urlQueryParams.get( 'hide_importer_link' ) === 'true' }
			onSkip={ () => {
				handleSubmit( isReprintFlow ? 'backup_file' : 'skip_platform_identification' );
			} }
			isReprintFlow={ isReprintFlow }
			siteURL={ siteURL }
			onSiteURLChange={ setSiteURL }
			flowName={ flow }
			onVisibilityChange={ ( isVisible, issue ) => {
				setIsVisible( isVisible );
				setConnectionIssue( issue );
			} }
		/>
	);

	return (
		<>
			<DocumentHead title={ isReprintFlow ? title : translate( 'Import your site content' ) } />
			<Step.CenteredColumnLayout
				className={ clsx( 'step-container-v2--site-migration-identify', {
					'site-migration-identify--reprint': isReprintFlow,
					'site-migration-identify--checking': isChecking,
					'site-migration-identify--connection-issue': !! connectionIssue,
				} ) }
				columnWidth={ isChecking || connectionIssue ? 6 : 4 }
				topBar={
					<Step.TopBar leftElement={ goBack ? <Step.BackButton onClick={ goBack } /> : null } />
				}
				heading={
					isChecking || isVisible ? <Step.Heading text={ title } subText={ subTitle } /> : undefined
				}
			>
				{ stepContent }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationIdentify;
