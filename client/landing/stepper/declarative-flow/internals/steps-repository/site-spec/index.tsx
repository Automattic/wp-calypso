import { isAutomatticianQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { getSessionId as getPostHogSessionId } from '@automattic/posthog';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import {
	getBlueprintArchiveSiteIdentifier,
	fetchBlueprintImportStatus,
	getSiteAdminUrl,
	getSiteEditorUrl,
	IMPORT_FAILURE_STATUSES,
	IMPORT_SUCCESS,
	logBlueprintArchiveEvent,
	startBlueprintArchiveImport,
	waitForAtomicTransferComplete,
	waitForBlueprintImportComplete,
} from 'calypso/landing/stepper/utils/blueprint-archive-import';
import {
	getBuildWowSiteIdentifier,
	isBuildWowEnabled,
	logBuildWowEvent,
	requestBuildWowSite,
} from 'calypso/landing/stepper/utils/build-wow';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteSpec } from 'calypso/lib/site-spec';
import {
	getBuildWowSiteSpecConfig,
	getCiabSiteSpecConfig,
	getDefaultSiteSpecConfig,
	getEarlyProvisionSiteSpecConfig,
	type SiteSpecConfig,
} from 'calypso/lib/site-spec/utils';
import wpcom from 'calypso/lib/wp';
import { buildEarlyProvisionDestination } from './early-provisioning';
import type { Step as StepType } from '../../types';

function SiteSpecContainer( {
	siteSpecConfig,
	onMessage,
	onSpecConfirm,
}: {
	siteSpecConfig?: SiteSpecConfig;
	onMessage?: ( message: unknown ) => void;
	onSpecConfirm?: ( specData: unknown ) => void | Promise< void >;
} ) {
	useSiteSpec( { siteSpecConfig, onMessage, onSpecConfirm } );

	return <div id="site-spec-container" style={ { height: '100vh' } } />;
}

function getSpecId( specData: unknown ): string {
	if ( typeof specData === 'string' ) {
		return specData;
	}

	if ( ! specData || typeof specData !== 'object' ) {
		return '';
	}

	const specRecord = specData as {
		data?: unknown;
		detail?: unknown;
		session_id?: unknown;
		sessionId?: unknown;
		spec_id?: unknown;
		specId?: unknown;
	};
	const specId =
		specRecord.session_id ?? specRecord.sessionId ?? specRecord.spec_id ?? specRecord.specId;

	if ( typeof specId === 'string' ) {
		return specId;
	}

	return getSpecId( specRecord.data ) || getSpecId( specRecord.detail );
}

type ActiveFlow = 'build-wow' | 'early-provision' | 'ciab' | 'default';

function getActiveFlow( {
	shouldBuildWow,
	shouldProvisionAtomicSite,
	isCiab,
}: {
	shouldBuildWow: boolean;
	shouldProvisionAtomicSite: boolean;
	isCiab: boolean;
} ): ActiveFlow {
	if ( shouldBuildWow ) {
		return 'build-wow';
	}
	if ( shouldProvisionAtomicSite ) {
		return 'early-provision';
	}
	if ( isCiab ) {
		return 'ciab';
	}
	return 'default';
}

function logEarlyProvisionEvent(
	type: string,
	properties: Record< string, unknown > = {},
	blogId?: number
): void {
	void logToLogstash( {
		feature: 'calypso_client',
		message: 'AI Site Builder early WPCOM Atomic provisioning',
		severity: 'debug',
		...( blogId ? { blog_id: blogId } : {} ),
		properties: {
			type: `ai_site_builder_early_wpcom_atomic_${ type }`,
			...properties,
		},
	} ).catch( () => {} );
}

const SiteSpec: StepType = function SiteSpec() {
	const translate = useTranslate();
	const queryParams = useQuery();
	const querySource = queryParams.get( 'source' );
	const isCiab = !! querySource && querySource.startsWith( 'ciab-' );
	const shouldEarlyProvisionSite = queryParams.get( 'early_provision_site' ) === '1';
	const shouldProvisionAtomicSite =
		shouldEarlyProvisionSite || queryParams.get( 'provision_target' ) === 'wpcom-atomic';
	const buildWowRequested = queryParams.get( 'build_wow' ) === '1';
	const { data: isAutomattician, isLoading: isLoadingAutomattician } = useReactQuery( {
		...isAutomatticianQuery(),
		enabled: buildWowRequested,
	} );
	const shouldBuildWow = isBuildWowEnabled( queryParams, isAutomattician === true );
	const activeFlow = getActiveFlow( { shouldBuildWow, shouldProvisionAtomicSite, isCiab } );
	const atomicProvisionSpecId = shouldProvisionAtomicSite ? queryParams.get( 'spec_id' ) ?? '' : '';
	const buildWowSpecId = shouldBuildWow ? queryParams.get( 'spec_id' ) ?? '' : '';
	const buildWowSiteIdentifier = getBuildWowSiteIdentifier( {
		siteSlug: queryParams.get( 'siteSlug' ),
		siteId: queryParams.get( 'siteId' ),
	} );

	const ciabSiteCreationPromiseRef = useRef< Promise< number | null > | null >( null );
	const shouldImportBlueprint = queryParams.get( 'blueprint_archive_import' ) === '1';
	const blueprintArchiveSlug = queryParams.get( 'blueprint_slug' ) ?? '';
	const blueprintArchiveSiteIdentifier = getBlueprintArchiveSiteIdentifier( {
		siteSlug: queryParams.get( 'siteSlug' ),
		siteId: queryParams.get( 'siteId' ),
	} );
	const messageCountRef = useRef( 0 );
	const isSubmittingRef = useRef( false );
	const blueprintImportStartedRef = useRef( false );
	// Set once anything observes the pre-checkout build finished — the start request's response,
	// or the background watcher below. Spec confirm then redirects immediately instead of
	// entering the poll loop. Mirrored to sessionStorage so a mid-spec reload keeps the signal.
	const blueprintImportCompleteRef = useRef( false );
	// Prefetched on readiness so confirm can redirect without any request at all.
	const blueprintAdminUrlRef = useRef< string | null >( null );
	const blueprintReadySessionKey = blueprintArchiveSiteIdentifier
		? `blueprint-import-ready-${ blueprintArchiveSiteIdentifier }`
		: null;

	const markBlueprintImportComplete = useCallback( () => {
		blueprintImportCompleteRef.current = true;
		if ( blueprintReadySessionKey ) {
			try {
				sessionStorage.setItem( blueprintReadySessionKey, '1' );
			} catch {
				// Storage unavailable: the ref still covers this page view.
			}
		}
		// Prefetch the redirect target so confirm is a pure navigation.
		if ( ! blueprintAdminUrlRef.current && blueprintArchiveSiteIdentifier ) {
			getSiteAdminUrl( blueprintArchiveSiteIdentifier )
				.then( ( adminUrl ) => {
					blueprintAdminUrlRef.current = adminUrl;
				} )
				.catch( () => {
					// Confirm falls back to fetching it.
				} );
		}
	}, [ blueprintReadySessionKey, blueprintArchiveSiteIdentifier ] );

	const handleCiabMessage = useCallback( () => {
		messageCountRef.current += 1;
		if ( messageCountRef.current !== 1 ) {
			return;
		}
		ciabSiteCreationPromiseRef.current = ( async () => {
			try {
				const response = ( await wpcom.req.post(
					{
						path: '/sites/new',
						apiVersion: '1.1',
					},
					{},
					{
						client_id: config( 'wpcom_signup_id' ),
						client_secret: config( 'wpcom_signup_key' ),
						garden_name: 'commerce',
						garden_partner_name: 'woo',
						blog_title: '',
						blog_name: '',
						options: {
							site_creation_flow: 'ai-site-builder',
							trigger_backend_build: false,
						},
					}
				) ) as { blog_details: { blogid: number } };

				return response?.blog_details?.blogid ?? null;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to create garden site:', error );
				return null;
			}
		} )();
	}, [] );

	const handleCiabSpecConfirm = useCallback( async ( specData: unknown ) => {
		if ( isSubmittingRef.current ) {
			return;
		}

		isSubmittingRef.current = true;

		const specId = getSpecId( specData );
		const blogId = ciabSiteCreationPromiseRef.current
			? await ciabSiteCreationPromiseRef.current
			: null;

		let url = `/setup/ai-site-builder/?create_garden_site=1&trigger_backend_build=0&spec_id=${ encodeURIComponent(
			specId
		) }`;
		if ( blogId ) {
			url += `&early_created_site=${ encodeURIComponent( blogId ) }`;
		}

		const phSessionId = getPostHogSessionId();
		if ( phSessionId ) {
			url += `&_ph=${ encodeURIComponent( phSessionId ) }`;
		}

		window.location.href = url;
	}, [] );

	const handleEarlyProvisionSpecConfirm = useCallback(
		( specData: unknown ) => {
			if ( isSubmittingRef.current ) {
				return;
			}

			isSubmittingRef.current = true;

			const specId = getSpecId( specData );
			if ( ! specId ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to continue site provisioning: missing site spec session ID.' );
				isSubmittingRef.current = false;
				return;
			}

			const phSessionId = getPostHogSessionId();
			const source = queryParams.get( 'source' );
			const destination = buildEarlyProvisionDestination( {
				specId,
				phSessionId,
				source,
			} );

			logEarlyProvisionEvent( 'spec_confirm_redirect', {
				spec_id: specId,
				destination_path: '/setup/ai-site-builder/',
			} );
			window.location.href = destination;
		},
		[ queryParams ]
	);

	const handleBuildWowSpecConfirm = useCallback(
		async ( specData: unknown ) => {
			if ( isSubmittingRef.current ) {
				return;
			}

			isSubmittingRef.current = true;

			const specId = getSpecId( specData );
			if ( ! specId ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to continue build-wow provisioning: missing site spec session ID.' );
				isSubmittingRef.current = false;
				return;
			}

			if ( ! buildWowSiteIdentifier ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to continue build-wow provisioning: missing target site.' );
				isSubmittingRef.current = false;
				return;
			}

			const specConfirmStartTime = Date.now();
			const elapsedMs = () => Date.now() - specConfirmStartTime;
			let responseBlogId: number | undefined;

			try {
				logBuildWowEvent( 'spec_confirm_request_start', {
					spec_id: specId,
					site_identifier: buildWowSiteIdentifier,
				} );

				const response = await requestBuildWowSite( buildWowSiteIdentifier, specId );
				responseBlogId = response.blog_id;

				logBuildWowEvent(
					'spec_confirm_response',
					{
						spec_id: specId,
						site_identifier: buildWowSiteIdentifier,
						elapsed_ms: elapsedMs(),
						atomic_ready_for_editor: response.atomic?.ready_for_editor,
						remote_option_ready: response.remote_option_ready,
						is_atomic: response.atomic?.is_atomic,
						is_transfer_active: response.atomic?.is_transfer_active,
						build_status: response.build?.status,
					},
					response.blog_id
				);

				if ( ! response.site_editor_url ) {
					throw new Error( 'Build-wow response is missing the Site Editor URL.' );
				}

				const source = queryParams.get( 'source' );
				const destination = addQueryArgs( response.site_editor_url, {
					spec_id: specId,
					...( source ? { source } : {} ),
				} );

				logBuildWowEvent(
					'site_generation_redirect',
					{
						spec_id: specId,
						site_identifier: buildWowSiteIdentifier,
						elapsed_ms: elapsedMs(),
					},
					responseBlogId
				);
				window.location.href = addQueryArgs( '/setup/ai-site-builder-spec/site-generation', {
					build_wow: '1',
					...( response.blog_id ? { siteId: response.blog_id } : {} ),
					siteSlug: buildWowSiteIdentifier,
					specId,
					editorUrl: destination,
				} );
			} catch ( error ) {
				logBuildWowEvent(
					'spec_confirm_error',
					{
						spec_id: specId,
						site_identifier: buildWowSiteIdentifier,
						elapsed_ms: elapsedMs(),
						error: error instanceof Error ? error.message : String( error ),
					},
					responseBlogId
				);
				// eslint-disable-next-line no-console
				console.error( 'Failed to continue build-wow provisioning:', error );
				isSubmittingRef.current = false;
			}
		},
		[ buildWowSiteIdentifier, queryParams ]
	);

	useEffect( () => {
		if ( activeFlow === 'build-wow' && buildWowSpecId ) {
			handleBuildWowSpecConfirm( { spec_id: buildWowSpecId } );
		} else if ( activeFlow === 'early-provision' && atomicProvisionSpecId ) {
			handleEarlyProvisionSpecConfirm( { spec_id: atomicProvisionSpecId } );
		}
	}, [
		activeFlow,
		buildWowSpecId,
		atomicProvisionSpecId,
		handleBuildWowSpecConfirm,
		handleEarlyProvisionSpecConfirm,
	] );

	// Blueprint archive import: the transfer-to-Atomic + archive restore runs in
	// the background (kicked off on mount below). On spec confirm we poll the
	// canonical Atomic transfer endpoint, then the import status, and finally hand
	// the user off to the Atomic Site Editor.
	const handleBlueprintArchiveSpecConfirm = useCallback( async () => {
		if ( isSubmittingRef.current ) {
			return;
		}

		if ( ! blueprintArchiveSiteIdentifier ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to finish blueprint import: missing target site.' );
			return;
		}

		isSubmittingRef.current = true;

		try {
			// When the build is already known to be finished — from the start response, the
			// background watcher, or a previous page view via sessionStorage — go straight to
			// the redirect. The polls are the fallback for a build still in flight.
			if ( ! blueprintImportCompleteRef.current ) {
				logBlueprintArchiveEvent( 'spec_confirm_poll_start', {
					site_identifier: blueprintArchiveSiteIdentifier,
				} );

				await waitForAtomicTransferComplete( blueprintArchiveSiteIdentifier );
				await waitForBlueprintImportComplete( blueprintArchiveSiteIdentifier );
			}
			const adminUrl =
				blueprintAdminUrlRef.current ?? ( await getSiteAdminUrl( blueprintArchiveSiteIdentifier ) );
			const siteEditorUrl = getSiteEditorUrl( adminUrl );

			logBlueprintArchiveEvent( 'redirect_site_editor', {
				site_identifier: blueprintArchiveSiteIdentifier,
			} );
			window.location.href = siteEditorUrl;
		} catch ( error ) {
			logBlueprintArchiveEvent( 'spec_confirm_error', {
				site_identifier: blueprintArchiveSiteIdentifier,
				error: error instanceof Error ? error.message : String( error ),
			} );
			// eslint-disable-next-line no-console
			console.error( 'Failed to finish blueprint import:', error );
			isSubmittingRef.current = false;
		}
	}, [ blueprintArchiveSiteIdentifier ] );

	// Kick off the background transfer + blueprint-archive import as soon as the
	// spec page mounts, so it runs while the user reviews the spec.
	useEffect( () => {
		if (
			! shouldImportBlueprint ||
			! blueprintArchiveSlug ||
			! blueprintArchiveSiteIdentifier ||
			blueprintImportStartedRef.current
		) {
			return;
		}

		blueprintImportStartedRef.current = true;

		logBlueprintArchiveEvent( 'start_request', {
			site_identifier: blueprintArchiveSiteIdentifier,
		} );

		// A mid-spec reload loses component state; the readiness flag survives in sessionStorage.
		if ( blueprintReadySessionKey ) {
			try {
				if ( '1' === sessionStorage.getItem( blueprintReadySessionKey ) ) {
					markBlueprintImportComplete();
				}
			} catch {
				// Storage unavailable: rely on the start response and the watcher.
			}
		}

		startBlueprintArchiveImport( blueprintArchiveSiteIdentifier, blueprintArchiveSlug )
			.then( ( status ) => {
				if ( status?.importStatus === IMPORT_SUCCESS ) {
					markBlueprintImportComplete();
				}
				logBlueprintArchiveEvent( 'start_success', {
					site_identifier: blueprintArchiveSiteIdentifier,
					already_complete: blueprintImportCompleteRef.current,
				} );
			} )
			.catch( ( error ) => {
				logBlueprintArchiveEvent( 'start_error', {
					site_identifier: blueprintArchiveSiteIdentifier,
					error: error instanceof Error ? error.message : String( error ),
				} );
			} );
	}, [
		shouldImportBlueprint,
		blueprintArchiveSlug,
		blueprintArchiveSiteIdentifier,
		blueprintReadySessionKey,
		markBlueprintImportComplete,
	] );

	// Watch the build in the background while the user reviews the spec, so readiness is known
	// the moment it happens rather than discovered by polling after confirm. Only records the
	// flag — the redirect itself always waits for the user to confirm. A terminal failure stops
	// the watcher and leaves error handling to the confirm path, which surfaces it properly.
	useEffect( () => {
		if ( ! shouldImportBlueprint || ! blueprintArchiveSiteIdentifier ) {
			return;
		}

		let cancelled = false;

		const interval = setInterval( async () => {
			if ( cancelled || blueprintImportCompleteRef.current ) {
				clearInterval( interval );
				return;
			}

			const status = await fetchBlueprintImportStatus( blueprintArchiveSiteIdentifier );

			if ( cancelled ) {
				return;
			}

			if ( IMPORT_SUCCESS === status ) {
				markBlueprintImportComplete();
				logBlueprintArchiveEvent( 'background_ready', {
					site_identifier: blueprintArchiveSiteIdentifier,
				} );
				clearInterval( interval );
			} else if ( status && IMPORT_FAILURE_STATUSES.includes( status ) ) {
				clearInterval( interval );
			}
		}, 5000 );

		return () => {
			cancelled = true;
			clearInterval( interval );
		};
	}, [ shouldImportBlueprint, blueprintArchiveSiteIdentifier, markBlueprintImportComplete ] );

	if ( buildWowRequested && isLoadingAutomattician ) {
		return <DocumentHead title={ translate( 'Build Your Site with AI' ) } />;
	}

	let siteSpecStep = <SiteSpecContainer />;
	if ( activeFlow === 'build-wow' ) {
		siteSpecStep = (
			<SiteSpecContainer
				siteSpecConfig={ getBuildWowSiteSpecConfig( {
					siteSlug: queryParams.get( 'siteSlug' ),
					siteId: queryParams.get( 'siteId' ),
					ref: queryParams.get( 'ref' ),
					source: querySource,
				} ) }
				onSpecConfirm={ handleBuildWowSpecConfirm }
			/>
		);
	} else if ( activeFlow === 'early-provision' ) {
		siteSpecStep = (
			<SiteSpecContainer
				siteSpecConfig={ getEarlyProvisionSiteSpecConfig() }
				onSpecConfirm={ handleEarlyProvisionSpecConfirm }
			/>
		);
	} else if ( shouldImportBlueprint ) {
		siteSpecStep = (
			<SiteSpecContainer
				siteSpecConfig={ getDefaultSiteSpecConfig() }
				onSpecConfirm={ handleBlueprintArchiveSpecConfirm }
			/>
		);
	} else if ( activeFlow === 'ciab' ) {
		siteSpecStep = (
			<SiteSpecContainer
				siteSpecConfig={ getCiabSiteSpecConfig() }
				onMessage={ handleCiabMessage }
				onSpecConfirm={ handleCiabSpecConfirm }
			/>
		);
	}

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			{ siteSpecStep }
		</>
	);
};

export default SiteSpec;
