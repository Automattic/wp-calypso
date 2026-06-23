import { AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';

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

type AtomicProvisioningSite = {
	URL?: string;
	slug?: string;
	is_wpcom_atomic?: boolean;
	options?: {
		is_wpcom_atomic?: boolean;
	};
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

function getAtomicSiteEditorBaseUrl( siteResponse: AtomicProvisioningSite ): string | null {
	if ( siteResponse?.URL ) {
		try {
			const url = new URL( siteResponse.URL );
			return url.origin;
		} catch {
			// Fall through to slug below.
		}
	}

	if ( siteResponse?.slug ) {
		return `https://${ siteResponse.slug.replace( /^https?:\/\//, '' ).replace( /\/$/, '' ) }`;
	}

	return null;
}

export async function getReadyAtomicSiteEditorUrl( {
	blogId,
	specId,
	source,
}: {
	blogId: number;
	specId: string;
	source?: string | null;
} ): Promise< string | null > {
	const siteResponse = ( await wpcom.req.get(
		{
			path: `/sites/${ blogId }`,
			apiVersion: '1.1',
		},
		{
			fields: 'ID,URL,slug,is_wpcom_atomic,options',
			options: 'is_wpcom_atomic',
		}
	) ) as AtomicProvisioningSite;

	if ( ! siteResponse?.is_wpcom_atomic && ! siteResponse?.options?.is_wpcom_atomic ) {
		return null;
	}

	const siteUrl = getAtomicSiteEditorBaseUrl( siteResponse );
	if ( ! siteUrl ) {
		return null;
	}

	return addQueryArgs( `${ siteUrl }/wp-admin/site-editor.php`, {
		p: '/',
		canvas: 'edit',
		'ai-step': 'edit',
		referrer: AI_SITE_BUILDER_FLOW,
		...( source ? { source } : {} ),
		...( specId ? { spec_id: specId } : {} ),
	} );
}
