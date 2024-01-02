declare module '@wordpress/format-library/build-module/default-formats' {
	import { type NamedFormatConfiguration } from '@wordpress/rich-text';

	const formats: NamedFormatConfiguration[];

	export default formats;
}

declare module '@verbum/block-editor' {
	export function addGutenberg(
		textarea: HTMLTextAreaElement,
		setComment: ( newValue: string ) => void
	): void;
}

declare module '!!css-loader!sass-loader!./inline-iframe-style.scss' {
	const css: string[];

	export default css;
}

declare module '@wordpress/block-library/build-module/*' {
	import { Block } from '@wordpress/blocks';

	const block: Block;

	export = block;
}
