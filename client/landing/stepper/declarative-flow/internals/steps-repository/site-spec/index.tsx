import config from '@automattic/calypso-config';
import { getSessionId as getPostHogSessionId } from '@automattic/posthog';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSpec } from 'calypso/lib/site-spec';
import {
	getCiabSiteSpecConfig,
	getTelexSiteSpecConfig,
	type SiteSpecConfig,
} from 'calypso/lib/site-spec/utils';
import wpcom from 'calypso/lib/wp';
import type { Step as StepType } from '../../types';

const TELEX_PROVISIONED_SITE_STORAGE_KEY = 'site-spec-telex-provisioned-site';

type TelexPrepareSiteResponse = {
	admin_url?: string;
	blog_id?: number;
	builder_session_id?: string;
	spec_id?: string;
	url?: string;
};

function saveTelexProvisionedSite( response: TelexPrepareSiteResponse ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.sessionStorage.setItem( TELEX_PROVISIONED_SITE_STORAGE_KEY, JSON.stringify( response ) );
}

function getSavedTelexProvisionedSite(): TelexPrepareSiteResponse | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	try {
		const stored = window.sessionStorage.getItem( TELEX_PROVISIONED_SITE_STORAGE_KEY );
		if ( ! stored ) {
			return null;
		}

		const parsed = JSON.parse( stored ) as TelexPrepareSiteResponse;
		return parsed && typeof parsed === 'object' ? parsed : null;
	} catch {
		return null;
	}
}

function clearSavedTelexProvisionedSite(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.sessionStorage.removeItem( TELEX_PROVISIONED_SITE_STORAGE_KEY );
}

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

function isTelexProvisionResponse(
	response: TelexPrepareSiteResponse | null
): response is TelexPrepareSiteResponse {
	return !! response?.builder_session_id;
}

const SiteSpec: StepType = function SiteSpec() {
	const translate = useTranslate();
	const queryParams = useQuery();
	const querySource = queryParams.get( 'source' );
	const isCiab = !! querySource && querySource.startsWith( 'ciab-' );
	const isTelexPrepare =
		queryParams.get( 'telex' ) === '1' ||
		queryParams.get( 'telex_prepare_site' ) === '1' ||
		querySource === 'telex';
	const telexSpecId = isTelexPrepare ? queryParams.get( 'spec_id' ) ?? '' : '';

	const ciabSiteCreationPromiseRef = useRef< Promise< number | null > | null >( null );
	const telexSiteProvisionPromiseRef = useRef< Promise< TelexPrepareSiteResponse | null > | null >(
		null
	);
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

	const handleTelexMessage = useCallback( () => {
		messageCountRef.current += 1;
		if ( messageCountRef.current !== 1 ) {
			return;
		}

		telexSiteProvisionPromiseRef.current = ( async () => {
			try {
				const response = ( await wpcom.req.post(
					{
						path: '/telex/prepare-site',
						apiVersion: '1.1',
					},
					{},
					{
						provision_only: true,
						user_confirmed: true,
					}
				) ) as TelexPrepareSiteResponse;
				if ( isTelexProvisionResponse( response ) ) {
					saveTelexProvisionedSite( response );
				}
				return response;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to provision Telex site:', error );
				return null;
			}
		} )();
	}, [] );

	const handleTelexSpecConfirm = useCallback( async ( specData: unknown ) => {
		if ( isSubmittingRef.current ) {
			return;
		}

		isSubmittingRef.current = true;

		const specId = getSpecId( specData );
		if ( ! specId ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to prepare Telex site: missing site spec session ID.' );
			isSubmittingRef.current = false;
			return;
		}

		try {
			const provisionedSiteFromPromise = telexSiteProvisionPromiseRef.current
				? await telexSiteProvisionPromiseRef.current
				: null;
			const provisionedSite = provisionedSiteFromPromise ?? getSavedTelexProvisionedSite();
			const requestBody: {
				builder_session_id?: string;
				spec_id: string;
				user_confirmed: boolean;
			} = {
				spec_id: specId,
				user_confirmed: true,
			};
			if ( provisionedSite?.builder_session_id ) {
				requestBody.builder_session_id = provisionedSite.builder_session_id;
			}

			const response = ( await wpcom.req.post(
				{
					path: '/telex/prepare-site',
					apiVersion: '1.1',
				},
				{},
				requestBody
			) ) as TelexPrepareSiteResponse;

			const destination = response.admin_url || response.url;
			if ( destination ) {
				clearSavedTelexProvisionedSite();
				window.location.href = addQueryArgs( destination, {
					spec_id: response.spec_id || specId,
				} );
				return;
			}

			throw new Error( 'Telex prepare-site response did not include a destination URL.' );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to prepare Telex site:', error );
			isSubmittingRef.current = false;
		}
	}, [] );

	useEffect( () => {
		if ( ! isTelexPrepare || ! telexSpecId ) {
			return;
		}

		handleTelexSpecConfirm( { spec_id: telexSpecId } );
	}, [ handleTelexSpecConfirm, isTelexPrepare, telexSpecId ] );

	let siteSpecStep = <SiteSpecContainer />;
	if ( isTelexPrepare ) {
		siteSpecStep = (
			<SiteSpecContainer
				siteSpecConfig={ getTelexSiteSpecConfig() }
				onMessage={ handleTelexMessage }
				onSpecConfirm={ handleTelexSpecConfirm }
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
