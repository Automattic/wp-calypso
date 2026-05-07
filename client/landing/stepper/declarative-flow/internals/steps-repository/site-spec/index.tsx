import config from '@automattic/calypso-config';
import { getSessionId as getPostHogSessionId } from '@automattic/posthog';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { Experiment } from 'calypso/lib/explat';
import { useSiteSpec } from 'calypso/lib/site-spec';
import { getCiabSiteSpecConfig, type SiteSpecConfig } from 'calypso/lib/site-spec/utils';
import { VEGA_EXPERIMENT_NAME, getVegaSiteSpecConfig } from 'calypso/lib/site-spec/vega';
import wpcom from 'calypso/lib/wp';
import type { Step as StepType } from '../../types';

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

const SiteSpec: StepType = function SiteSpec() {
	const translate = useTranslate();
	const queryParams = useQuery();
	const querySource = queryParams.get( 'source' );
	const isCiab = !! querySource && querySource.startsWith( 'ciab-' );

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

		const sessionId =
			specData && typeof specData === 'object' && 'session_id' in specData
				? ( specData as { session_id?: string } ).session_id
				: undefined;
		const specId = sessionId || '';
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

	const treatmentConfig = useMemo< SiteSpecConfig >( () => {
		const vegaConfig = getVegaSiteSpecConfig();
		return {
			...vegaConfig,
			tracking: vegaConfig.tracking && {
				...vegaConfig.tracking,
				getOverrides: ( event: string ) => ( {
					...vegaConfig.tracking?.getOverrides?.( event ),
					experiment_variation: 'treatment',
				} ),
			},
		};
	}, [] );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			{ isCiab ? (
				<SiteSpecContainer
					siteSpecConfig={ getCiabSiteSpecConfig() }
					onMessage={ handleCiabMessage }
					onSpecConfirm={ handleCiabSpecConfirm }
				/>
			) : (
				<Experiment
					name={ VEGA_EXPERIMENT_NAME }
					loadingExperience={ null }
					defaultExperience={ <SiteSpecContainer /> }
					treatmentExperience={ <SiteSpecContainer siteSpecConfig={ treatmentConfig } /> }
				/>
			) }
		</>
	);
};

export default SiteSpec;
