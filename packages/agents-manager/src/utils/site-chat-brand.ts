import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { isReaderChatHost } from './is-reader-chat-agent';

/**
 * Site Chat brand kit accessors.
 *
 * Jetpack resolves a site's brand (name, logo, accent, greeting) server-side
 * and the reader-chat entry copies it onto `agentsManagerData`. Only the
 * reader-chat host may read it: a blog's branding must never leak into
 * wp-admin, Big Sky, or the orchestrator, all of which share these components.
 *
 * Every accessor is defensive. Jetpack omits keys that resolve to nothing, and
 * a cached copy of the reader-chat bundle can run against a PHP deploy that
 * sends no brand at all — so "absent" is a normal state, not an error.
 */

/**
 * The site's assistant name, or undefined when unbranded or off-host.
 */
export function getBrandName(): string | undefined {
	if ( ! isReaderChatHost() ) {
		return undefined;
	}

	return getAgentsManagerInlineData()?.brandName || undefined;
}

/**
 * The site's logo URL, or undefined when unbranded or off-host.
 */
export function getBrandLogoUrl(): string | undefined {
	if ( ! isReaderChatHost() ) {
		return undefined;
	}

	return getAgentsManagerInlineData()?.brandLogoUrl || undefined;
}
