import { getLoadedProviderIds } from './loaded-provider-ids';

const WOO_AI_PROVIDER_ID = 'woocommerce-ai';
const WOO_ZENDESK_INTEGRATION_KEY = 'woo';

export function isWooAiProvider( providerIds = getLoadedProviderIds() ): boolean {
	return providerIds?.includes( WOO_AI_PROVIDER_ID ) ?? false;
}

export function getWooZendeskIntegrationKey(
	configuredIntegrationKey?: string
): string | undefined {
	if ( ! isWooAiProvider() ) {
		return undefined;
	}

	return configuredIntegrationKey ?? WOO_ZENDESK_INTEGRATION_KEY;
}
