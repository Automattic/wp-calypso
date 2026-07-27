// For marketplace plugins (e.g. sensei-pro), the Atomic transfer + plugin install is initiated during
// checkout, not by this component — so `atomicFlow` is never set and the .org-directory data is absent
// (`wporg === false`). Detecting this flow lets the caller keep the site's plugins fresh after the
// transfer so the redirect can fire once the plugin reports active.
export function isMarketplacePluginActivationFlow( {
	atomicFlow,
	isPluginUploadFlow,
	pluginSlug,
	freshSite,
	wporgPlugin,
}: {
	atomicFlow: boolean;
	isPluginUploadFlow: boolean;
	pluginSlug: string;
	freshSite: { is_wpcom_atomic?: boolean } | null | undefined;
	wporgPlugin: { wporg?: boolean } | null | undefined;
} ): boolean {
	return (
		! atomicFlow &&
		! isPluginUploadFlow &&
		!! pluginSlug &&
		!! freshSite?.is_wpcom_atomic &&
		wporgPlugin?.wporg === false
	);
}
