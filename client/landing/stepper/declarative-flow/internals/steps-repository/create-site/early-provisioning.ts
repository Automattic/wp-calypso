import { AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import { pollUntil, PollTimeoutError } from 'calypso/landing/stepper/utils/poll-until';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';

export const EARLY_PROVISION_TARGET_WPCOM_ATOMIC = 'wpcom-atomic';

type AtomicProvisioningSite = {
	URL?: string;
	slug?: string;
	is_wpcom_atomic?: boolean;
	options?: {
		is_wpcom_atomic?: boolean;
	};
};

export function getEarlyCreatedSiteId(
	flow: string | undefined,
	earlyCreatedSite: string | null
): number | null {
	if ( flow !== AI_SITE_BUILDER_FLOW || ! earlyCreatedSite ) {
		return null;
	}

	const blogId = parseInt( earlyCreatedSite, 10 );
	if ( isNaN( blogId ) ) {
		throw new Error( 'Invalid early_created_site parameter.' );
	}

	return blogId;
}

export function getAtomicProvisionedSiteSlug(
	siteResponse: AtomicProvisioningSite,
	fallbackSiteId: number
): string {
	if ( siteResponse?.slug ) {
		return siteResponse.slug;
	}

	if ( siteResponse?.URL ) {
		try {
			return new URL( siteResponse.URL ).host;
		} catch {
			// Fall through to the numeric site ID below.
		}
	}

	return String( fallbackSiteId );
}

function logAtomicProvisioningEvent(
	type: string,
	siteId: number,
	properties: Record< string, unknown > = {}
): void {
	void logToLogstash( {
		feature: 'calypso_client',
		message: 'AI Site Builder early WPCOM Atomic provisioning',
		severity: 'debug',
		blog_id: siteId,
		properties: {
			type: `ai_site_builder_early_wpcom_atomic_${ type }`,
			...properties,
		},
	} ).catch( () => {} );
}

export async function pollForAtomicProvisioning(
	siteId: number,
	maxAttempts = 100,
	delayMs = 3000,
	initialDelayMs = 0
) {
	const startTime = Date.now();

	try {
		return await pollUntil(
			async ( attempt ) => {
				const siteResponse = ( await wpcom.req.get(
					{
						path: `/sites/${ siteId }`,
						apiVersion: '1.1',
					},
					{
						fields: 'ID,URL,slug,is_wpcom_atomic,options',
						options: 'is_wpcom_atomic',
					}
				) ) as AtomicProvisioningSite;

				if ( ! siteResponse?.is_wpcom_atomic && ! siteResponse?.options?.is_wpcom_atomic ) {
					return undefined;
				}

				const siteSlug = getAtomicProvisionedSiteSlug( siteResponse, siteId );
				logAtomicProvisioningEvent( 'ready', siteId, {
					attempt,
					duration_ms: Date.now() - startTime,
					site_slug: siteSlug,
				} );
				return { siteSlug };
			},
			{ maxAttempts, intervalMs: delayMs, initialDelayMs }
		);
	} catch ( error ) {
		if ( ! ( error instanceof PollTimeoutError ) ) {
			throw error;
		}

		logAtomicProvisioningEvent( 'timeout', siteId, {
			attempts: maxAttempts,
			duration_ms: Date.now() - startTime,
		} );

		const timeoutError = new Error(
			'We were unable to finish provisioning your site. Please try again or contact support.'
		) as Error & { code: string };
		timeoutError.code = 'wpcom_atomic_provisioning_timeout';
		throw timeoutError;
	}
}
