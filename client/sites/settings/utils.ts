export function isSiteSettingsUntangled() {
	const isDuplicateViewsExperiment = true;
	return isDuplicateViewsExperiment && window?.location?.pathname?.startsWith( '/sites/settings' );
}
