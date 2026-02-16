import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSpec } from 'calypso/lib/site-spec';
import { getCiabSiteSpecConfig, type SiteSpecConfig } from 'calypso/lib/site-spec/utils';
import type { Step as StepType } from '../../types';

const SiteSpec: StepType = function SiteSpec() {
	const translate = useTranslate();
	const queryParams = useQuery();
	const source = queryParams.get( 'source' );

	let siteCreationPromise: Promise< number | null > | null = null;
	let isSubmitting = false;

	const handleFirstMessage = async ( _message: string, sessionId: string ) => {
		siteCreationPromise = ( async () => {
			try {
				const response = ( await wpcomRequest( {
					path: '/sites/new',
					apiVersion: '1.1',
					method: 'POST',
					body: {
						client_id: config( 'wpcom_signup_id' ),
						client_secret: config( 'wpcom_signup_key' ),
						garden_name: 'commerce',
						garden_partner_name: 'woo',
						spec_id: sessionId,
						options: {
							site_creation_flow: 'ai-site-builder',
							trigger_backend_build: false,
						},
					},
				} ) ) as { blog_details: { blogid: number } };

				return response?.blog_details?.blogid ?? null;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to create garden site:', error );
				return null;
			}
		} )();
	};

	const handleSpecConfirm = async ( specData: any ) => {
		if ( isSubmitting ) {
			return;
		}
		isSubmitting = true;

		const specId = specData.spec_id || specData.session_id || '';
		const blogId = siteCreationPromise ? await siteCreationPromise : null;
		const earlyCreatedParam = blogId || 'failed';

		window.location.href = `/setup/ai-site-builder/?create_garden_site=1&spec_id=${ encodeURIComponent(
			specId
		) }&early_created_site=${ earlyCreatedParam }`;
	};

	let siteSpecConfig: SiteSpecConfig | undefined;
	if ( source && source.startsWith( 'ciab-' ) ) {
		siteSpecConfig = {
			...getCiabSiteSpecConfig(),
			onFirstMessage: handleFirstMessage,
			onSpecConfirm: handleSpecConfirm,
		} as SiteSpecConfig;
	}

	useSiteSpec( { siteSpecConfig } );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div id="site-spec-container" style={ { height: '100vh' } } />
		</>
	);
};

export default SiteSpec;
