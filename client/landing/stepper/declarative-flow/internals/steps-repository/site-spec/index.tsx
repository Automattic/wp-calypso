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
	getEarlyProvisionSiteSpecConfig,
	type SiteSpecConfig,
} from 'calypso/lib/site-spec/utils';
import wpcom from 'calypso/lib/wp';
import type { Step as StepType } from '../../types';

const EARLY_PROVISIONED_SITE_STORAGE_KEY = 'site-spec-early-provisioned-site';
const EARLY_PROVISION_TARGET_WPCOM_ATOMIC = 'wpcom-atomic';
const EARLY_PROVISION_ERROR_MESSAGE = 'Failed to start WPCOM Atomic early provisioning.';

type SiteCreateResponse = {
	blog_details?: {
		blogid?: number | string;
	};
	atomic_transfer?: {
		id?: number | string;
		status?: string;
	};
	early_provision_target?: string;
};

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

	const handleEarlyProvisionMessage = useCallback( () => {
		messageCountRef.current += 1;
		if ( messageCountRef.current !== 1 ) {
			return;
		}

		earlyProvisionSitePromiseRef.current = ( async () => {
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
						blog_title: '',
						blog_name: '',
						options: {
							site_creation_flow: 'ai-site-builder',
							trigger_backend_build: false,
							early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
						},
					}
				) ) as SiteCreateResponse;
				const blogId = response?.blog_details?.blogid
					? parseInt( String( response.blog_details.blogid ), 10 )
					: null;

				if ( blogId && ! Number.isNaN( blogId ) ) {
					saveEarlyProvisionedSite( blogId );
					return blogId;
				}

				return null;
			} catch ( error ) {
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
					handleEarlyProvisionMessage();
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
				const destination = addQueryArgs( '/setup/ai-site-builder/', {
					trigger_backend_build: '0',
					spec_id: specId,
					early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
					...( blogId ? { early_created_site: blogId } : {} ),
					...( phSessionId ? { _ph: phSessionId } : {} ),
					...( source ? { source } : {} ),
				} );

				clearSavedEarlyProvisionedSite();
				window.location.href = destination;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to continue site provisioning:', error );
				isSubmittingRef.current = false;
			}
		},
		[ handleEarlyProvisionMessage, queryParams ]
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
				onMessage={ handleEarlyProvisionMessage }
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
