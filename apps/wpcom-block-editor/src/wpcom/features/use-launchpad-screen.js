const useLaunchpadScreen = () => {
	// We have this data populated, on window.Jetpack_LaunchpadSaveModal, so we should use it.
	return {
		launchpad_screen: window.Jetpack_LaunchpadSaveModal?.launchpadScreenOption,
	};
};

export default useLaunchpadScreen;
