import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSpec } from 'calypso/lib/site-spec';
import { getCiabSiteSpecConfig } from 'calypso/lib/site-spec/utils';
import type { Step as StepType } from '../../types';

const SiteSpec: StepType = function SiteSpec() {
	const translate = useTranslate();
	const queryParams = useQuery();
	const source = queryParams.get( 'source' );
	const isCiab = source && source.startsWith( 'ciab-' );

	let siteCreationPromise: Promise< number | null > | null = null;
	let messageCount = 0;
	let isSubmitting = false;

	const handleMessage = () => {
		messageCount++;
		if ( messageCount === 1 ) {
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
							blog_title: '',
							blog_name: '',
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
		}
	};

	const handleSpecConfirm = async ( specData: any ) => {
		if ( isSubmitting ) {
			return;
		}

		isSubmitting = true;

		const specId = specData.session_id || '';
		const blogId = siteCreationPromise ? await siteCreationPromise : null;

		let url = `/setup/ai-site-builder/?create_garden_site=1&spec_id=${ encodeURIComponent(
			specId
		) }`;
		if ( blogId ) {
			url += `&early_created_site=${ encodeURIComponent( blogId ) }`;
		}

		window.location.href = url;
	};

	const siteSpecConfig = isCiab ? getCiabSiteSpecConfig() : undefined;

	useSiteSpec( {
		siteSpecConfig,
		onMessage: isCiab ? handleMessage : undefined,
		onSpecConfirm: isCiab ? handleSpecConfirm : undefined,
	} );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div id="site-spec-container" style={ { height: '100vh' } } />
		</>
	);
};

export default SiteSpec;
