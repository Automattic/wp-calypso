declare module '@wordpress/notices' {
	export type Status = 'error' | 'info' | 'success' | 'warning';
}

declare module '@wordpress/rich-text' {
	interface Format {
		type: string;
		attributes?: Record< string, string > | undefined;
		unregisteredAttributes?: Record< string, string > | undefined;
		object?: boolean | undefined;
	}

	export interface Value {
		activeFormats?: readonly Format[] | undefined;
		end?: number | undefined;
		formats: ReadonlyArray< Format[] | undefined >;
		replacements: ReadonlyArray< Format[] | undefined >;
		start?: number | undefined;
		text: string;
	}
}
