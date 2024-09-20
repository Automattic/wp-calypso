const useLaunchpadScreen = () => {
	// We have this data populated, on window.launchpadOptions, so we should use it.
	return {
		launchpad_screen: window.launchpadOptions?.launchpadScreenOption,
	};
};

export default useLaunchpadScreen;
