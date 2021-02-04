// This empty module corresponds to a WordPress script handle of the same name.
// Our build system externalizes and adds it to the script dependencies when it's imported.
declare module 'a8c-fse-common-data-stores' {}

interface Window {
	wpcomEditorSiteLaunch?: {
		launchUrl: string;
		launchFlow: string;
		// property does not exist when not isGutenboarding
		// property holds the value '1' when isGutenboarding
		isGutenboarding?: '1';
		locale?: string;
	};
	_currentSiteId: number;
	calypsoifyGutenberg?: {
		isGutenboarding?: boolean;
		currentCalypsoUrl?: string;
		closeUrl?: string;
		closeButtonLabel?: string;
		// @TODO: this is just temporary for testing via feature flag. Remove it once focused-launch is live
		isFocusedLaunchFlow?: boolean;
	};
}
