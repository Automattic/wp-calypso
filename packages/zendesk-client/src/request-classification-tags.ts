/**
 * External dependencies
 */
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

const MAX_TAGS = 30;
const MAX_JOINED_LENGTH = 1000;
const CLASSIFICATION_TAG_PATTERN = /^cl_[A-Za-z0-9_]{1,80}$/;
const CLASSIFIED_TAG = 'cl_classified';

type ClassificationResponse = { classification_tags?: unknown };

/**
 * - `classified`: the server returned valid tags.
 * - `not_classified`: the server returned no tags, for example with classification turned off.
 * - `unsupported`: the response has no `classification_tags`, so the server can't classify.
 * - `invalid`: the server returned tags that failed `sanitizeClassificationTags`.
 * - `error`: the request failed.
 */
export type ClassificationStatus =
	'classified' | 'not_classified' | 'unsupported' | 'invalid' | 'error';

export type ClassificationResult = { tags: string[]; status: ClassificationStatus };

// Requests still running, by chat. A retry while one runs waits for it instead of classifying the
// chat again. Once it ends, the server's own cache answers a retry.
const pendingRequests = new Map< string, Promise< ClassificationResult > >();

/**
 * Returns the classification tags only when every one of them is valid, otherwise none.
 * A partial list would still carry `cl_classified`, which stops Zendesk from classifying
 * the ticket itself.
 */
export function sanitizeClassificationTags( tags: unknown ): string[] {
	if ( ! Array.isArray( tags ) || tags.length < 1 || tags.length > MAX_TAGS ) {
		return [];
	}

	const isValid =
		tags.every( ( tag ) => typeof tag === 'string' && CLASSIFICATION_TAG_PATTERN.test( tag ) ) &&
		tags.includes( CLASSIFIED_TAG ) &&
		tags.join( ',' ).length <= MAX_JOINED_LENGTH;

	return isValid ? [ ...tags ] : [];
}

/**
 * Asks wpcom to classify an Odie chat with Zendesk's classifier, and resolves to the
 * `cl_*` tags for the ticket about to be created from it. Never rejects: any failure
 * resolves to no tags, with a status that says why, and Zendesk then classifies the
 * ticket as usual.
 */
export function requestClassificationTags(
	aiChatId: string | number
): Promise< ClassificationResult > {
	const key = String( aiChatId );
	const pending = pendingRequests.get( key );
	if ( pending ) {
		return pending;
	}

	const request = fetchClassificationTags( aiChatId ).finally( () =>
		pendingRequests.delete( key )
	);
	pendingRequests.set( key, request );
	return request;
}

async function fetchClassificationTags(
	aiChatId: string | number
): Promise< ClassificationResult > {
	const fields = { classify_ai_chat_id: aiChatId };

	let response: ClassificationResponse | undefined;
	try {
		response = await ( canAccessWpcomApis()
			? wpcomRequest< ClassificationResponse >( {
					path: '/help/zendesk/update-user-fields',
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					body: { fields },
				} )
			: apiFetch< ClassificationResponse >( {
					global: true,
					path: '/help-center/zendesk/user-fields',
					method: 'POST',
					data: { fields },
				} as APIFetchOptions< true > ) );
	} catch {
		return { tags: [], status: 'error' };
	}

	const received = response?.classification_tags;
	if ( received === undefined ) {
		return { tags: [], status: 'unsupported' };
	}
	if ( Array.isArray( received ) && received.length === 0 ) {
		return { tags: [], status: 'not_classified' };
	}

	const tags = sanitizeClassificationTags( received );
	return { tags, status: tags.length ? 'classified' : 'invalid' };
}
