type CalypsoifyGutenberg = {
	closeUrl: string;
	manageReusableBlocksUrl: string;
	createNewPostUrl: string;
};

declare global {
	interface Window {
		calypsoifyGutenberg: CalypsoifyGutenberg;
	}
}

export {};
