declare module '@wordpress/blocks' {
	export interface BlockInstance< T extends Record< string, any > = { [ k: string ]: any } > {
		readonly attributes: T;
		readonly clientId: string;
		readonly innerBlocks: BlockInstance[];
		readonly isValid: boolean;
		readonly name: string;
		readonly originalContent?: string | undefined;
	}

	export function parse( content: string ): BlockInstance[];

	export function cloneBlock< T extends Record< string, any > >(
		block: BlockInstance< T >,
		mergeAttributes?: Partial< T >,
		newInnerBlocks?: BlockInstance[]
	): BlockInstance< T >;
}

declare const __i18n_text_domain__: string;
