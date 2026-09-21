/**
 * Whether Agents Manager is running with the Woo AI provider configuration.
 * The Woo entry point is the only host that supplies its dedicated Zendesk integration key.
 */
export function isWooAiProvider( zendeskSmoochIntegrationKey?: string ): boolean {
	return zendeskSmoochIntegrationKey === 'woo';
}
