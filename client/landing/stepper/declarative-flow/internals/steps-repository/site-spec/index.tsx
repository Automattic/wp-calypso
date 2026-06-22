import config from '@automattic/calypso-config';
import { getSessionId as getPostHogSessionId } from '@automattic/posthog';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSpec } from 'calypso/lib/site-spec';
import { getCiabSiteSpecConfig, type SiteSpecConfig } from 'calypso/lib/site-spec/utils';
import wpcom from 'calypso/lib/wp';
import type { Step as StepType } from '../../types';

type TelexPrepareSiteResponse = {
	admin_url?: string;
	url?: string;
};

function SiteSpecContainer( {
	siteSpecConfig,
	onMessage,
	onSpecConfirm,
}: {
	siteSpecConfig?: SiteSpecConfig;
	onMessage?: ( message: unknown ) => void;
	onSpecConfirm?: ( specData: unknown ) => void;
} ) {
	useSiteSpec( { siteSpecConfig, onMessage, onSpecConfirm } );
	return <div id="site-spec-container" style={ { height: '100vh' } } />;
}

function getSpecId( specData: unknown ): string {
	if ( ! specData || typeof specData !== 'object' ) {
		return '';
	}

	const specRecord = specData as { session_id?: unknown; spec_id?: unknown };
	const specId = specRecord.session_id ?? specRecord.spec_id;

	return typeof specId === 'string' ? specId : '';
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

	const siteCreationPromiseRef = useRef< Promise< number | null > | null >( null );
	const messageCountRef = useRef( 0 );
	const isSubmittingRef = useRef( false );

	const handleCiabMessage = useCallback( () => {
		messageCountRef.current += 1;
		if ( messageCountRef.current !== 1 ) {
			return;
		}
		siteCreationPromiseRef.current = ( async () => {
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
		const blogId = siteCreationPromiseRef.current ? await siteCreationPromiseRef.current : null;

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
			const response = ( await wpcom.req.post(
				{
					path: '/telex/prepare-site',
					apiVersion: '1.1',
				},
				{},
				{
					spec_id: specId,
					user_confirmed: true,
				}
			) ) as TelexPrepareSiteResponse;

			const destination = response.admin_url || response.url;
			if ( destination ) {
				window.location.href = destination;
				return;
			}

			throw new Error( 'Telex prepare-site response did not include a destination URL.' );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to prepare Telex site:', error );
			isSubmittingRef.current = false;
		}
	}, [] );

	let siteSpecStep = <SiteSpecContainer />;
	if ( isTelexPrepare ) {
		siteSpecStep = <SiteSpecContainer onSpecConfirm={ handleTelexSpecConfirm } />;
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
