type CalypsoifyGutenberg = {
	closeUrl: string;
	manageReusableBlocksUrl: string;
	createNewPostUrl: string;
	isGutenboarding?: boolean;
};

declare global {
	interface Window {
		calypsoifyGutenberg: CalypsoifyGutenberg;
	}
}

export {};
