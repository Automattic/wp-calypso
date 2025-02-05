import { getIsRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';

export async function isSiteSettingsUntangled() {
	const isRemoveDuplicateViewsExperimentEnabled =
		await getIsRemoveDuplicateViewsExperimentEnabled();
	return (
		isRemoveDuplicateViewsExperimentEnabled &&
		window?.location?.pathname?.startsWith( '/sites/settings' )
	);
}
