import { addQueryArgs } from '@wordpress/url';

export const EARLY_PROVISIONED_SITE_STORAGE_KEY = 'site-spec-early-provisioned-site';
export const EARLY_PROVISION_TARGET_WPCOM_ATOMIC = 'wpcom-atomic';
export const EARLY_PROVISION_ERROR_MESSAGE = 'Failed to start WPCOM Atomic early provisioning.';

export type SiteCreateResponse = {
	blog_details?: {
		blogid?: number | string;
	};
	atomic_transfer?: {
		id?: number | string;
		status?: string;
	};
	early_provision_target?: string;
};

export function getEarlyProvisionSiteCreateBody( clientId: unknown, clientSecret: unknown ) {
	return {
		client_id: clientId,
		client_secret: clientSecret,
		blog_title: '',
		blog_name: '',
		options: {
			site_creation_flow: 'ai-site-builder',
			trigger_backend_build: false,
			early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
		},
	};
}

export function getEarlyProvisionedSiteId( response: SiteCreateResponse ): number | null {
	const blogId = response?.blog_details?.blogid
		? parseInt( String( response.blog_details.blogid ), 10 )
		: null;
	const atomicTransferId = response?.atomic_transfer?.id;

	if (
		response?.early_provision_target === EARLY_PROVISION_TARGET_WPCOM_ATOMIC &&
		atomicTransferId &&
		blogId &&
		! Number.isNaN( blogId )
	) {
		return blogId;
	}

	return null;
}

export function buildEarlyProvisionDestination( {
	specId,
	blogId,
	phSessionId,
	source,
}: {
	specId: string;
	blogId: number;
	phSessionId?: string | null;
	source?: string | null;
} ): string {
	return addQueryArgs( '/setup/ai-site-builder/', {
		trigger_backend_build: '0',
		spec_id: specId,
		early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
		early_created_site: blogId,
		...( phSessionId ? { _ph: phSessionId } : {} ),
		...( source ? { source } : {} ),
	} );
}
