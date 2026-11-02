import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { Step } from '@automattic/onboarding';
import { Notice, VisuallyHidden } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect, useState, useCallback, useRef } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import ScanningStep from 'calypso/blocks/import/scanning';
import { CAPTURE_URL_RGX, convertPlatformName } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { urlToDomain } from 'calypso/lib/url';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import warningIcon from './warning.svg';
import type { Step as StepType } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

type ConnectionIssue = 'unreachable';

// How long checking a site stays on screen at least, so a quick answer doesn't flash past.
const MINIMUM_CHECK_DURATION_MS = 1500;

interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: UrlData, hostingProviderSlug?: string ) => void;
	onSkip: ( from?: string ) => void;
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
	// The health is from our own fetch of the homepage, not from how the migration will reach the site.
	let isUnhealthy = typeof siteHealth === 'string' && siteHealth !== 'ok';
	// A site we know is WordPress can still be migrated when its homepage is a 404.
	if ( isUnhealthy && ! hasError && siteInfo?.platform === 'wordpress' ) {
		isUnhealthy = siteHealth !== 'not_found';
	}
	let connectionIssue: ConnectionIssue | undefined;
	if ( isReprintFlow && siteURL && ! isFetching ) {
		if (
			( ! siteInfo || hasError || [ 'wordpress', 'unknown' ].includes( siteInfo.platform ) ) &&
			( isUnhealthy ||
				( hasError &&
					error &&
					'code' in error &&
					( error.code === 'http_request_failed' || error.code === 'rest_invalid_param' ) ) )
		) {
			connectionIssue = 'unreachable';
		}
	}

	// Fetch hosting provider after we get site info
	const domain = siteInfo && ! connectionIssue ? urlToDomain( siteInfo.url ) : '';
	const {
		data: hostingProviderData,
		isFetching: isFetchingHosting,
		isError: hasHostingError,
	} = useHostingProviderQuery( domain, !! domain, isReprintFlow ? 5000 : undefined );

	// Each new address or retry keeps the check on screen for a moment before its outcome shows.
	const [ isHeld, setIsHeld ] = useState( false );
	useEffect( () => {
		setIsHeld( isReprintFlow && !! siteURL );
	}, [ isReprintFlow, siteURL ] );
	useEffect( () => {
		if ( isReprintFlow && siteURL && isFetching ) {
			setIsHeld( true );
		}
	}, [ isReprintFlow, siteURL, isFetching ] );
	useEffect( () => {
		if ( ! isHeld ) {
			return;
		}
		const timeout = setTimeout( () => setIsHeld( false ), MINIMUM_CHECK_DURATION_MS );
		return () => clearTimeout( timeout );
	}, [ isHeld ] );
	const shownIssue = isHeld ? undefined : connectionIssue;

	// Update loading state to include hosting check
	const isScanning =
		! shownIssue && ( isHeld || isFetching || isFetchingHosting || ( isFetched && ! hasError ) );
	const isFormHidden = isReprintFlow && !! shownIssue;

	useEffect( () => {
		// Only complete when we have both site info AND hosting info (or hosting check failed)
		if (
			siteURL &&
			siteInfo &&
			! isHeld &&
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
		isHeld,
		hostingProviderData,
		hasHostingError,
		hasError,
		isFetching,
		isFetchingHosting,
		connectionIssue,
	] );

	useEffect( () => {
		onVisibilityChange?.( ! isScanning, shownIssue );
	}, [ isScanning, shownIssue, onVisibilityChange ] );

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

	return (
		<>
			{ isReprintFlow && (
				<VisuallyHidden role="status">
					{ isScanning ? translate( 'Checking your site' ) : '' }
				</VisuallyHidden>
			) }
			{ isFormHidden && (
				<div className="site-migration-identify__checking">
					<div className="site-migration-identify__summary">
						<span>{ hostname }</span>
						<Step.LinkButton href={ sourceURL } target="_blank" rel="noopener noreferrer">
							{ platformName
								? translate( '%(platform)s site ↗', { args: { platform: platformName } } )
								: translate( 'View site ↗' ) }
						</Step.LinkButton>
					</div>
					<div className="site-migration-identify__status site-migration-identify__connection-issue">
						<Notice status="warning" isDismissible={ false }>
							<img src={ warningIcon } alt="" width={ 24 } height={ 24 } />
							<span>{ translate( 'Couldn’t connect' ) }</span>
						</Notice>
						<p>
							{ translate(
								'Check the address and try again. If your site is down, our team can take a look and help you migrate it once it’s back.'
							) }
						</p>
						<div className="site-migration-identify__actions">
							<Step.PrimaryButton onClick={ () => refetch() }>
								{ translate( 'Try again' ) }
							</Step.PrimaryButton>
						</div>
						<Step.LinkButton onClick={ () => onSkip( sourceURL ) }>
							{ translate( 'pick your current platform from a list' ) }
						</Step.LinkButton>
					</div>
				</div>
			) }
			<div className="import__capture-container" hidden={ isFormHidden }>
				{ isReprintFlow && siteURL && hasError && ! isScanning && ! shownIssue && (
					<Notice
						status="error"
						isDismissible={ false }
						className="site-migration-identify__analysis-error"
					>
						<span role="alert">{ translate( 'We couldn’t check your site. Try again.' ) }</span>
					</Notice>
				) }
				<CaptureInput
					onInputEnter={ ( url ) => {
						if ( isReprintFlow && url === siteURL ) {
							refetch();
						} else {
							onSiteURLChange( url );
						}
					} }
					onInputChange={ () => onSiteURLChange( '' ) }
					hasError={ ! isReprintFlow && hasError }
					isBusy={ isReprintFlow && isScanning }
					skipInitialChecking
					onDontHaveSiteAddressClick={ ( url ) => {
						if ( ! isReprintFlow || ! url ) {
							return onSkip();
						}
						onSkip( /^https?:\/\//i.test( url ) ? url : `https://${ url }` );
					} }
					placeholder={ translate( 'your-existing-site.com' ) }
					label={ translate( 'Site address' ) }
					dontHaveSiteAddressLabel={ translate(
						'Or <button>pick your current platform from a list</button>'
					) }
					hideImporterListLink={
						hideImporterListLink && ! ( isReprintFlow && siteURL && hasError )
					}
					nextLabelText={ isReprintFlow ? translate( 'Continue' ) : translate( 'Check my site' ) }
				/>
			</div>
		</>
	);
};

export type SiteMigrationIdentifyAction = 'continue' | 'skip_platform_identification';

const SiteMigrationIdentify: StepType< {
	accepts: { checkOnArrival?: boolean };
	submits:
		| {
				action: SiteMigrationIdentifyAction;
				platform?: string;
				from?: string;
				host?: string;
				isWpcom?: boolean;
		  }
		| undefined;
} > = function ( { navigation, flow, checkOnArrival = false } ) {
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
		[ navigation, createScreenshots ]
	);

	const urlQueryParams = useQuery();

	const [ siteURL, setSiteURL ] = useState( () => {
		const from = urlQueryParams.get( 'from' ) || '';
		return checkOnArrival && CAPTURE_URL_RGX.test( from ) ? from : '';
	} );
	const [ isVisible, setIsVisible ] = useState( ! siteURL );
	const [ connectionIssue, setConnectionIssue ] = useState< ConnectionIssue >();

	useEffect( () => {
		const onPageShow = ( event: PageTransitionEvent ) => {
			if ( event.persisted ) {
				setSiteURL( '' );
			}
		};
		window.addEventListener( 'pageshow', onPageShow );
		return () => window.removeEventListener( 'pageshow', onPageShow );
	}, [] );

	const isChecking = isReprintFlow && ! isVisible;
	const goBack = isChecking || connectionIssue ? () => setSiteURL( '' ) : navigation?.goBack;
	let title = translate( "Let's find your site" );
	let subTitle = translate( 'Enter your current site address below to get started.' );
	if ( connectionIssue === 'unreachable' ) {
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
				} ).catch( () => setSiteURL( '' ) )
			}
			hideImporterListLink={ urlQueryParams.get( 'hide_importer_link' ) === 'true' }
			onSkip={ ( from ) =>
				navigation.submit?.( {
					action: 'skip_platform_identification',
					...( from ? { from } : {} ),
				} )
			}
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
					'site-migration-identify--connection-issue': !! connectionIssue,
				} ) }
				columnWidth={ connectionIssue ? 6 : 4 }
				topBar={
					<Step.TopBar leftElement={ goBack ? <Step.BackButton onClick={ goBack } /> : null } />
				}
				heading={
					isReprintFlow || isVisible ? (
						<Step.Heading text={ title } subText={ subTitle } />
					) : undefined
				}
			>
				{ stepContent }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationIdentify;
