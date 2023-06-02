// FIXME: We can use `useSiteIntent` from `@automattic/data-stores` and remove this.
// https://github.com/Automattic/wp-calypso/pull/73565#discussion_r1113839120
const useSiteIntent = () => {
	// We can skip the request altogether since this information is already added to the window in
	// https://github.com/Automattic/jetpack/blob/e135711f9a130946dae1bca6c9c0967350331067/projects/plugins/jetpack/extensions/plugins/launchpad-save-modal/launchpad-save-modal.php#LL31C8-L31C34
	// We could update this to use the launchpad endpoint in jetpack-mu-wpcom, but that may require
	// permissions changes as it requires 'manage_options' to read
	// https://github.com/Automattic/jetpack/blob/e135711f9a130946dae1bca6c9c0967350331067/projects/packages/jetpack-mu-wpcom/src/features/wpcom-endpoints/class-wpcom-rest-api-v2-endpoint-launchpad.php#L121.
	return {
		siteIntent: window.Jetpack_LaunchpadSaveModal?.siteIntentOption,
		siteIntentFetched: true,
	};
};
export default useSiteIntent;
