import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { Notice, VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToDomain } from 'calypso/lib/url';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import warningIcon from './warning.svg';
import type { Step as StepType } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import 'calypso/components/account-template/style.scss';
import './style.scss';

type ConnectionIssue = 'unreachable';

// How long checking a site stays on screen at least, so a quick answer doesn't flash past.
const MINIMUM_CHECK_DURATION_MS = 1500;

const getSiteHostname = ( url: string ) =>
	getUrlParts( /^https?:\/\//i.test( url ) ? url : `https://${ url }` )
		.hostname.replace( /^www\./, '' )
		.replace( /\.$/, '' );

interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: Omit< UrlData, 'meta' >, hostingProviderSlug?: string ) => void;
	onSkip: ( from?: string ) => void;
	hideImporterListLink: boolean;
	flowName: string;
	onVisibilityChange: ( isVisible: boolean, issue?: ConnectionIssue ) => void;
	isReprintFlow?: boolean;
	isManualWordPress: boolean;
	siteURL: string;
	onSiteURLChange: ( url: string ) => void;
	destinationSiteUrls?: string[];
}

export const Analyzer: FC< Props > = ( {
	onComplete,
	onSkip,
	onVisibilityChange,
	hideImporterListLink = false,
	isReprintFlow = false,
	isManualWordPress,
	siteURL,
	onSiteURLChange,
	destinationSiteUrls = [],
} ) => {
	const translate = useTranslate();
	const enteredURL = /^https?:\/\//i.test( siteURL ) ? siteURL : `https://${ siteURL }`;
	const isDestinationUrl = ( sourceUrl: string ) =>
		isReprintFlow &&
		!! getSiteHostname( sourceUrl ) &&
		destinationSiteUrls.some( ( url ) => getSiteHostname( url ) === getSiteHostname( sourceUrl ) );
	const isDestinationSite = isDestinationUrl( siteURL );
	const onCompleteRef = useRef( onComplete );
	onCompleteRef.current = onComplete;
	const {
		data: siteInfo,
		isError: hasError,
		isFetching,
		isFetched,
		refetch,
		error,
	} = useAnalyzeUrlQuery( siteURL, siteURL !== '' && ! isDestinationSite );

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
	if ( isReprintFlow && ! isManualWordPress && ! isDestinationSite && siteURL && ! isFetching ) {
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
	const domain =
		siteInfo && ! connectionIssue && ! isDestinationSite ? urlToDomain( siteInfo.url ) : '';
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
		! isDestinationSite &&
		! shownIssue &&
		( isHeld || isFetching || isFetchingHosting || ( isFetched && ! hasError ) );
	const isFormHidden = isReprintFlow && !! shownIssue;

	useEffect( () => {
		if (
			siteURL &&
			! isDestinationSite &&
			( siteInfo || ( isManualWordPress && hasError ) ) &&
			! isHeld &&
			! connectionIssue &&
			( ! hasError || isManualWordPress ) &&
			! isFetching &&
			! isFetchingHosting &&
			( hostingProviderData || hasHostingError || ( isManualWordPress && hasError ) )
		) {
			onCompleteRef.current(
				siteInfo ?? { url: enteredURL, platform: 'wordpress' },
				hostingProviderData?.hosting_provider?.slug
			);
		}
	}, [
		siteURL,
		isDestinationSite,
		siteInfo,
		isManualWordPress,
		enteredURL,
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
				{ isDestinationSite && (
					<Notice
						status="error"
						isDismissible={ false }
						className="site-migration-identify__analysis-error"
					>
						<span role="alert">
							{ __(
								'This is your destination site. Enter the address of the site you want to migrate from.'
							) }
						</span>
					</Notice>
				) }
				{ isReprintFlow &&
					siteURL &&
					hasError &&
					! isDestinationSite &&
					! isScanning &&
					! shownIssue && (
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
						if ( isReprintFlow && url === siteURL && ! isDestinationSite ) {
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
						if ( url && isDestinationUrl( url ) ) {
							return onSiteURLChange( url );
						}
						if ( ! isReprintFlow || ! url ) {
							return onSkip();
						}
						onSkip( /^https?:\/\//i.test( url ) ? url : `https://${ url }` );
					} }
					placeholder={ translate( 'your-existing-site.com' ) }
					label={ translate( 'Site address' ) }
					dontHaveSiteAddressLabel={
						isManualWordPress
							? translate( 'Or <button>select another platform from the list</button>' )
							: translate( 'Or <button>pick your current platform from a list</button>' )
					}
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
	accepts: { checkOnArrival?: boolean; destinationSiteUrls?: string[] };
	submits:
		| {
				action: SiteMigrationIdentifyAction;
				platform?: string;
				from?: string;
				host?: string;
				isWpcom?: boolean;
				staticSiteImportable?: boolean;
		  }
		| undefined;
} > = function ( { navigation, flow, stepName, checkOnArrival = false, destinationSiteUrls } ) {
	const translate = useTranslate();
	const locale = useLocale();
	const isReprintFlow = config.isEnabled( 'migration/reprint-flow' );
	const { createScreenshots } = useSitePreviewMShotImageHandler();

	const handleSubmit = useCallback(
		async (
			action: SiteMigrationIdentifyAction,
			data?: {
				platform: string;
				from: string;
				host?: string;
				isWpcom?: boolean;
				staticSiteImportable?: boolean;
			}
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

	const isManualWordPress = isReprintFlow && urlQueryParams.get( 'manualPlatform' ) === 'wordpress';

	const [ siteURL, setSiteURL ] = useState( () => {
		const from = urlQueryParams.get( 'from' ) || '';
		return checkOnArrival && ! isManualWordPress && CAPTURE_URL_RGX.test( from ) ? from : '';
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
	const contentRef = useRef< HTMLDivElement >( null );
	const [ isReturningToAddress, setIsReturningToAddress ] = useState( false );
	const changeAddress =
		isChecking || connectionIssue
			? () => {
					setSiteURL( '' );
					setIsReturningToAddress( true );
				}
			: undefined;

	// Change address unmounts itself, so focus would drop to the page. Once the field is
	// editable again, it takes the focus instead.
	useEffect( () => {
		if ( ! isReturningToAddress ) {
			return;
		}
		const input = contentRef.current?.querySelector< HTMLInputElement >( 'input[type="text"]' );
		if ( input && ! input.readOnly ) {
			input.focus();
			setIsReturningToAddress( false );
		}
	}, [ isReturningToAddress, siteURL, isVisible, connectionIssue ] );
	let title = isManualWordPress
		? translate( "Let's find your WordPress site" )
		: translate( "Let's find your site" );
	let subTitle = translate( 'Enter your current site address below to get started.' );
	if ( connectionIssue === 'unreachable' ) {
		title = translate( 'We couldn’t reach your site' );
		subTitle = translate(
			'It may be offline, behind a login, or blocking automated visitors. Nothing has changed on your site.'
		);
	}

	const stepContent = (
		<Analyzer
			destinationSiteUrls={ destinationSiteUrls }
			onComplete={ (
				{ platform, url, platform_data, static_site_importable },
				hostingProviderSlug
			) =>
				handleSubmit( 'continue', {
					platform: isManualWordPress ? 'wordpress' : platform,
					from: url,
					host: hostingProviderSlug,
					...( isReprintFlow && platform_data?.is_wpcom ? { isWpcom: true } : {} ),
					...( ! isManualWordPress && static_site_importable
						? { staticSiteImportable: true }
						: {} ),
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
			isManualWordPress={ isManualWordPress }
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
				columnWidth={ 4 }
				topBar={
					<Step.TopBar
						logoHref={ localizeUrl( 'https://wordpress.com/', locale ) }
						onLogoClick={ () =>
							recordTracksEvent( 'calypso_signup_logo_click', { flow, step: stepName } )
						}
					/>
				}
			>
				<div className="account-template" ref={ contentRef }>
					{ ( isReprintFlow || isVisible ) && <Step.Heading text={ title } subText={ subTitle } /> }
					{ stepContent }
					{ changeAddress && (
						<div className="account-template__secondary-actions">
							<Step.LinkButton onClick={ changeAddress }>
								{ translate( 'Change address' ) }
							</Step.LinkButton>
						</div>
					) }
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationIdentify;
