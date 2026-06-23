import config from '@automattic/calypso-config';
import { getSessionId as getPostHogSessionId } from '@automattic/posthog';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteSpec } from 'calypso/lib/site-spec';
import {
	getCiabSiteSpecConfig,
	getEarlyProvisionSiteSpecConfig,
	type SiteSpecConfig,
} from 'calypso/lib/site-spec/utils';
import wpcom from 'calypso/lib/wp';
import {
	EARLY_PROVISIONED_SITE_STORAGE_KEY,
	EARLY_PROVISION_ERROR_MESSAGE,
	buildEarlyProvisionDestination,
	getEarlyProvisionSiteCreateBody,
	getEarlyProvisionedSiteId,
	getReadyAtomicSiteEditorUrl,
	type SiteCreateResponse,
} from './early-provisioning';
import type { Step as StepType } from '../../types';

function saveEarlyProvisionedSite( blogId: number ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.sessionStorage.setItem( EARLY_PROVISIONED_SITE_STORAGE_KEY, String( blogId ) );
}

function getSavedEarlyProvisionedSite(): number | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const stored = window.sessionStorage.getItem( EARLY_PROVISIONED_SITE_STORAGE_KEY );
	if ( ! stored ) {
		return null;
	}

	const blogId = parseInt( stored, 10 );
	return Number.isNaN( blogId ) ? null : blogId;
}

function clearSavedEarlyProvisionedSite(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.sessionStorage.removeItem( EARLY_PROVISIONED_SITE_STORAGE_KEY );
}

function SiteSpecContainer( {
	siteSpecConfig,
	onFirstIntent,
	onMessage,
	onSpecConfirm,
}: {
	siteSpecConfig?: SiteSpecConfig;
	onFirstIntent?: () => void;
	onMessage?: ( message: unknown ) => void;
	onSpecConfirm?: ( specData: unknown ) => void | Promise< void >;
} ) {
	useSiteSpec( { siteSpecConfig, onMessage, onSpecConfirm } );

	useEffect( () => {
		if ( ! onFirstIntent || typeof document === 'undefined' ) {
			return;
		}

		const container = document.getElementById( 'site-spec-container' );
		if ( ! container ) {
			return;
		}

		const handleSubmit = () => onFirstIntent();

		const handleClick = ( event: MouseEvent ) => {
			const target = event.target;
			if ( ! ( target instanceof HTMLElement ) ) {
				return;
			}

			const control = target.closest( 'button,[role="button"],input[type="submit"]' );
			if ( control && container.contains( control ) ) {
				onFirstIntent();
			}
		};

		const handleKeyDown = ( event: KeyboardEvent ) => {
			if (
				event.key !== 'Enter' ||
				event.shiftKey ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey
			) {
				return;
			}

			const target = event.target;
			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				( target instanceof HTMLElement && target.isContentEditable )
			) {
				onFirstIntent();
			}
		};

		container.addEventListener( 'submit', handleSubmit, true );
		container.addEventListener( 'click', handleClick, true );
		container.addEventListener( 'keydown', handleKeyDown, true );

		return () => {
			container.removeEventListener( 'submit', handleSubmit, true );
			container.removeEventListener( 'click', handleClick, true );
			container.removeEventListener( 'keydown', handleKeyDown, true );
		};
	}, [ onFirstIntent ] );

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
	const earlyProvisionSpecId = shouldEarlyProvisionSite ? queryParams.get( 'spec_id' ) ?? '' : '';

	const ciabSiteCreationPromiseRef = useRef< Promise< number | null > | null >( null );
	const earlyProvisionSitePromiseRef = useRef< Promise< number | null > | null >( null );
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

	const startEarlyProvisionSite = useCallback( ( trigger: string ) => {
		if ( earlyProvisionSitePromiseRef.current || getSavedEarlyProvisionedSite() ) {
			return;
		}

		logEarlyProvisionEvent( 'create_request_start', { trigger } );

		earlyProvisionSitePromiseRef.current = ( async () => {
			try {
				const response = ( await wpcom.req.post(
					{
						path: '/sites/new',
						apiVersion: '1.1',
					},
					{},
					getEarlyProvisionSiteCreateBody(
						config( 'wpcom_signup_id' ),
						config( 'wpcom_signup_key' )
					)
				) ) as SiteCreateResponse;
				const blogId = getEarlyProvisionedSiteId( response );

				if ( blogId ) {
					saveEarlyProvisionedSite( blogId );
					logEarlyProvisionEvent(
						'create_request_success',
						{
							trigger,
							atomic_transfer_id: response.atomic_transfer?.id,
							atomic_transfer_status: response.atomic_transfer?.status,
						},
						blogId
					);
					return blogId;
				}

				logEarlyProvisionEvent( 'create_request_invalid_response', { trigger } );
				return null;
			} catch ( error ) {
				logEarlyProvisionEvent( 'create_request_error', {
					trigger,
					error: error instanceof Error ? error.message : String( error ),
				} );
				// eslint-disable-next-line no-console
				console.error( 'Failed to provision site:', error );
				return null;
			}
		} )();
	}, [] );

	const handleEarlyProvisionSpecConfirm = useCallback(
		async ( specData: unknown ) => {
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

			try {
				if ( ! earlyProvisionSitePromiseRef.current && ! getSavedEarlyProvisionedSite() ) {
					startEarlyProvisionSite( 'spec_confirm_fallback' );
				}

				const blogIdFromPromise = earlyProvisionSitePromiseRef.current
					? await earlyProvisionSitePromiseRef.current
					: null;
				const blogId = blogIdFromPromise ?? getSavedEarlyProvisionedSite();
				if ( ! blogId ) {
					throw new Error( EARLY_PROVISION_ERROR_MESSAGE );
				}

				const phSessionId = getPostHogSessionId();
				const source = queryParams.get( 'source' );
				let directSiteEditorUrl: string | null = null;
				try {
					directSiteEditorUrl = await getReadyAtomicSiteEditorUrl( {
						blogId,
						specId,
						source,
					} );
				} catch ( error ) {
					logEarlyProvisionEvent(
						'direct_ready_check_error',
						{
							spec_id: specId,
							error: error instanceof Error ? error.message : String( error ),
						},
						blogId
					);
				}

				if ( directSiteEditorUrl ) {
					logEarlyProvisionEvent(
						'site_editor_direct_redirect',
						{
							spec_id: specId,
						},
						blogId
					);
					clearSavedEarlyProvisionedSite();
					window.location.href = directSiteEditorUrl;
					return;
				}

				logEarlyProvisionEvent(
					'site_editor_direct_not_ready',
					{
						spec_id: specId,
						destination_path: '/setup/ai-site-builder/',
					},
					blogId
				);

				const destination = buildEarlyProvisionDestination( {
					specId,
					blogId,
					phSessionId,
					source,
				} );

				logEarlyProvisionEvent(
					'spec_confirm_redirect',
					{
						spec_id: specId,
						destination_path: '/setup/ai-site-builder/',
					},
					blogId
				);
				clearSavedEarlyProvisionedSite();
				window.location.href = destination;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to continue site provisioning:', error );
				isSubmittingRef.current = false;
			}
		},
		[ queryParams, startEarlyProvisionSite ]
	);

	useEffect( () => {
		if ( ! shouldEarlyProvisionSite || ! earlyProvisionSpecId ) {
			return;
		}

		handleEarlyProvisionSpecConfirm( { spec_id: earlyProvisionSpecId } );
	}, [ handleEarlyProvisionSpecConfirm, shouldEarlyProvisionSite, earlyProvisionSpecId ] );

	let siteSpecStep = <SiteSpecContainer />;
	if ( shouldEarlyProvisionSite ) {
		siteSpecStep = (
			<SiteSpecContainer
				siteSpecConfig={ getEarlyProvisionSiteSpecConfig() }
				onFirstIntent={ () => startEarlyProvisionSite( 'first_intent' ) }
				onMessage={ () => startEarlyProvisionSite( 'site_spec_message' ) }
				onSpecConfirm={ handleEarlyProvisionSpecConfirm }
			/>
		);
	} else if ( isCiab ) {
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
