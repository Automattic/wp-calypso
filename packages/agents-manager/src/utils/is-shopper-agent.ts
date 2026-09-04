/**
 * WooCommerce shopper agent identification helper.
 *
 * The WooCommerce AI shopper assistant mounts AgentsManager on storefront pages
 * for anonymous shoppers, with a host-customized empty view (greeting, help copy,
 * and shopping-oriented suggestion chips) and client-side state persistence.
 * Mirrors `is-plugin-compass-agent.ts`.
 */

import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';

const WOO_SHOPPER_AGENT_ID = 'woo-shopper-assistant';

/**
 * True if the current host is running under the WooCommerce shopper agent.
 * Reads `agentsManagerData.agentId` via the shared inline-data accessor (the
 * plugin emits it as a `const`, so a bare/global read is required).
 */
export function isShopperHost(): boolean {
	return getAgentsManagerInlineData()?.agentId === WOO_SHOPPER_AGENT_ID;
}
