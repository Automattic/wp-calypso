interface Window {
	commentBlockEditorInitialized: boolean;
}

declare const window: Window;
declare const VerbumComments: { embedNonce: string };

declare module '@wordpress/block-library/build-module/*' {
	import { type Block } from '@wordpress/blocks';

	const block: {
		settings: any;
		name: string;
		metadata: Block;
	};

	export = block;
}

declare module '@wordpress/format-library/build/default-formats' {
	import { type NamedFormatConfiguration } from '@wordpress/rich-text';

	const formats: NamedFormatConfiguration[];

	export default formats;
}

declare module '*.scss?inline' {
	const classes: { [ key: string ]: string };

	export default classes;
}
