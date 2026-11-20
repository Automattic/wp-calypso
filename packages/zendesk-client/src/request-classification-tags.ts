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
 * resolves to no tags, and Zendesk then classifies the ticket as usual.
 */
export async function requestClassificationTags( aiChatId: string | number ): Promise< string[] > {
	const fields = { classify_ai_chat_id: aiChatId };

	try {
		const response = await ( canAccessWpcomApis()
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

		return sanitizeClassificationTags( response?.classification_tags );
	} catch {
		return [];
	}
}
