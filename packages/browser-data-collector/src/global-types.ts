export enum EffectiveConnectionType {
	'2g',
	'3g',
	'4g',
	'slow-2g',
}

declare global {
	interface Navigator {
		deviceMemory: number;
		connection: {
			effectiveType: EffectiveConnectionType;
		};
	}

	interface Window {
		COMMIT_SHA: string;
		BUILD_TARGET: string;
		configData: {
			env_id: string;
		};
	}
}
