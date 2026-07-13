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
	getBuildWowSiteIdentifier,
	isBuildWowEnabled,
	isBuildWowSiteEditorReady,
	logBuildWowEvent,
	requestBuildWowSite,
	waitForBuildWowSiteEditorReady,
} from 'calypso/landing/stepper/utils/build-wow';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteSpec } from 'calypso/lib/site-spec';
import {
	getBuildWowSiteSpecConfig,
	getCiabSiteSpecConfig,
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
	const messageCountRef = useRef( 0 );
	const isSubmittingRef = useRef( false );

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
				const isReadyForEditor = isBuildWowSiteEditorReady( response );

				logBuildWowEvent(
					'spec_confirm_response',
					{
						spec_id: specId,
						site_identifier: buildWowSiteIdentifier,
						elapsed_ms: elapsedMs(),
						ready_for_editor: isReadyForEditor,
						atomic_ready_for_editor: response.atomic?.ready_for_editor,
						remote_option_ready: response.remote_option_ready,
						is_atomic: response.atomic?.is_atomic,
						is_transfer_active: response.atomic?.is_transfer_active,
						build_status: response.build?.status,
					},
					response.blog_id
				);

				if ( ! isReadyForEditor ) {
					const waitStartTime = Date.now();
					logBuildWowEvent(
						'site_editor_ready_wait_start',
						{
							spec_id: specId,
							site_identifier: buildWowSiteIdentifier,
							elapsed_ms: elapsedMs(),
							ready_for_editor: isReadyForEditor,
							remote_option_ready: response.remote_option_ready,
							is_atomic: response.atomic?.is_atomic,
							is_transfer_active: response.atomic?.is_transfer_active,
						},
						response.blog_id
					);

					await waitForBuildWowSiteEditorReady( buildWowSiteIdentifier );

					logBuildWowEvent(
						'site_editor_ready_wait_complete',
						{
							spec_id: specId,
							site_identifier: buildWowSiteIdentifier,
							elapsed_ms: elapsedMs(),
							wait_elapsed_ms: Date.now() - waitStartTime,
						},
						response.blog_id
					);
				}

				if ( ! response.site_editor_url ) {
					throw new Error( 'Build-wow response is missing the Site Editor URL.' );
				}

				const source = queryParams.get( 'source' );
				const destination = addQueryArgs( response.site_editor_url, {
					spec_id: specId,
					...( source ? { source } : {} ),
				} );

				logBuildWowEvent(
					'site_editor_redirect',
					{
						spec_id: specId,
						site_identifier: buildWowSiteIdentifier,
						elapsed_ms: elapsedMs(),
					},
					responseBlogId
				);
				window.location.href = destination;
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
