import 'react';
declare module '*.svg' {
	const url: string;
	export default url;
}

declare const __i18n_text_domain__: string;

declare module 'react' {
	/**
	 * Indicates that the browser will ignore this element and its descendants,
	 * preventing some interactions and hiding it from assistive technology.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert
	 * @todo Remove when switched to React 19+
	 */
	interface HTMLAttributes< T > extends AriaAttributes, DOMAttributes< T > {
		inert?: '';
	}
}
