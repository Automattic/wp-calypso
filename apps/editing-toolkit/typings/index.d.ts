import '@automattic/calypso-build';

// This empty module corresponds to a WordPress script handle of the same name.
// Our build system externalizes and adds it to the script dependencies when it's imported.
declare module 'a8c-fse-common-data-stores' {}

declare module '*.svg' {
	const url: string;
}

declare global {
	interface Window {
		_currentSiteId: number;
		calypsoifyGutenberg?: {
			isGutenboarding?: boolean;
			currentCalypsoUrl?: string;
			closeUrl?: string;
			closeButtonLabel?: string;
			manageReusableBlocksUrl?: string;
		};
		launchpadOptions: {
			siteUrlOption: string;
			launchpadScreenOption: 'full' | 'off' | 'minimized';
			siteIntentOption: string;
		};
		sharingModalOptions: {
			isDismissed: boolean;
		};
		wpcomGutenberg?: {
			blogPublic?: string;
		};
	}
}
