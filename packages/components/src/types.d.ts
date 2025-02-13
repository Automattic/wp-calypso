declare module '*.svg' {
	const url: string;
	export default url;
}

declare const __i18n_text_domain__: string;

// See: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/f6d4d15522356eba4a0267142834e3abc6b603fc/types/react/index.d.ts#L2580-L2587
declare module 'csstype' {
	interface Properties {
		// Allow any CSS Custom Properties
		[ index: `--${ string }` ]: unknown;
	}
}
