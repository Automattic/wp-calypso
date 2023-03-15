declare module '@wordpress/blocks' {
	export type AxialDirection = 'horizontal' | 'vertical';

	export type CSSDirection = 'top' | 'right' | 'bottom' | 'left';

	export type BlockAlignment = 'left' | 'center' | 'right' | 'wide' | 'full';

	export interface BlockEditProps< T extends Record< string, any > > extends BlockSaveProps< T > {
		readonly clientId: string;
		readonly isSelected: boolean;
		readonly setAttributes: ( attrs: Partial< T > ) => void;
		readonly context: Record< string, unknown >;
	}

	export interface BlockIconNormalized {
		background?: string | undefined;
		foreground?: string | undefined;
		shadowColor?: string | undefined;
		src: Dashicon.Icon | ReactElement | ComponentType;
	}

	export type BlockIcon = BlockIconNormalized[ 'src' ] | BlockIconNormalized;

	export interface BlockSaveProps< T extends Record< string, any > > {
		readonly className: string;
		readonly attributes: Readonly< T >;
	}

	export interface BlockStyle {
		readonly name: string;
		readonly label: string;
		readonly isDefault?: boolean | undefined;
	}

	export interface ColorProps {
		background: boolean;
		gradients: boolean;
		link: boolean;
		text: boolean;
	}

	export interface TypographyProps {
		fontSize: boolean;
		lineHeight: boolean;
	}

	export interface SpacingProps {
		blockGap: boolean | AxialDirection[];
		margin: boolean | CSSDirection[];
		padding: boolean | CSSDirection[];
	}

	type BlockExampleInnerBlock = Partial< Block > &
		Pick< Block, 'name' | 'attributes' > & {
			innerBlocks?: ReadonlyArray< BlockExampleInnerBlock >;
		};

	export interface Block< T extends Record< string, any > > {
		readonly apiVersion?: number;
		readonly attributes: {
			readonly [ k in keyof T ]: BlockAttribute< T[ k ] extends Array< infer U > ? U : T[ k ] >;
		};
		readonly category: string;
		readonly deprecated?: ReadonlyArray< BlockDeprecation< T > > | undefined;
		readonly description?: string | undefined;
		readonly edit?: ComponentType< BlockEditProps< T > > | undefined;
		readonly editorScript?: string;
		readonly editorStyle?: string;
		readonly example?: Readonly<
			Partial< Block > & { innerBlocks?: ReadonlyArray< BlockExampleInnerBlock > }
		>;
		readonly icon: BlockIconNormalized;
		readonly keywords?: readonly string[] | undefined;
		readonly parent?: readonly string[] | undefined;
		readonly ancestor?: readonly string[] | undefined;
		readonly providesContext?: Record< string, keyof T >;
		readonly name: string;
		readonly save: ComponentType< BlockSaveProps< T > >;
		readonly script?: string;
		readonly style?: string;
		readonly styles?: readonly BlockStyle[] | undefined;
		readonly supports?: BlockSupports | undefined;
		readonly textdomain?: string;
		readonly title: string;
		readonly transforms?:
			| {
					readonly from?: ReadonlyArray< Transform< T > > | undefined;
					readonly to?: readonly Transform[] | undefined;
			  }
			| undefined;
		readonly usesContext?: string[];
		readonly version?: string;
		getEditWrapperProps?( attrs: T ): Record< string, string | number | boolean >;
		merge?( attributes: T, attributesToMerge: T ): Partial< T >;
	}

	export type BlockConfiguration< T extends Record< string, any > > = Partial<
		Omit< Block< T >, 'icon' >
	> &
		Pick< Block< T >, 'attributes' | 'category' | 'title' > & {
			icon?: BlockIcon | undefined;
		};

	export interface BlockInstance< T extends Record< string, any > = { [ k: string ]: any } > {
		readonly attributes: T;
		readonly clientId: string;
		readonly innerBlocks: BlockInstance[];
		readonly isValid: boolean;
		readonly name: string;
		readonly originalContent?: string | undefined;
	}

	export interface BlockDeprecation<
		N extends Record< string, any >,
		O extends Record< string, any > = Record< string, any >
	> extends Pick< Block< O >, 'attributes' | 'save' | 'supports' > {
		isEligible?( attributes: Record< string, any >, innerBlocks: BlockInstance[] ): boolean;
		migrate?( attributes: O, innerBlocks: BlockInstance[] ): N | [ N, BlockInstance[] ];
	}

	export interface BlockSupports {
		readonly align?: boolean | readonly BlockAlignment[] | undefined;
		readonly alignWide?: boolean | undefined;
		readonly anchor?: boolean | undefined;
		readonly color?: Partial< ColorProps > | undefined;
		readonly customClassName?: boolean | undefined;
		readonly className?: boolean | undefined;
		readonly html?: boolean | undefined;
		readonly inserter?: boolean | undefined;
		readonly multiple?: boolean | undefined;
		readonly reusable?: boolean | undefined;
		readonly spacing?: Partial< SpacingProps > | undefined;
		readonly lock?: boolean | undefined;
		readonly typography?: Partial< TypographyProps > | undefined;
	}

	export namespace AttributeSource {
		type Attribute = {
			source: 'attribute';
			attribute: string;
			selector?: string | undefined;
		} & (
			| {
					type: 'boolean';
					default?: boolean | undefined;
			  }
			| {
					type: 'number';
					default?: number | undefined;
			  }
			| {
					type: 'string';
					default?: string | undefined;
			  }
		 );

		interface Children {
			source: 'children';
			type: 'array';
			selector?: string | undefined;
		}

		interface HTML {
			source: 'html';
			type: 'string';
			multiline?: 'li' | 'p' | undefined;
			selector?: string | undefined;
			default?: string | undefined;
		}

		interface Meta {
			source: 'meta';
			type: 'string';
			meta: string;
			default?: string | undefined;
		}

		interface Query< T > {
			source: 'query';
			type: 'array';
			selector: string;
			query: {
				[ k in keyof T ]: BlockAttribute< T[ k ] extends Array< infer U > ? U : T[ k ] >;
			};
			default?: any[] | undefined;
		}

		interface Text {
			source: 'text';
			type: 'string';
			selector?: string | undefined;
			default?: string | undefined;
		}

		type None =
			| ( {
					source?: never | undefined;
			  } & (
					| {
							type: 'array';
							default?: any[] | undefined;
					  }
					| {
							type: 'object';
							default?: object | undefined;
					  }
					| {
							type: 'boolean';
							default?: boolean | undefined;
					  }
					| {
							type: 'number';
							default?: number | undefined;
					  }
					| {
							type: 'string';
							default?: string | undefined;
					  }
			   ) )
			| 'array'
			| 'object'
			| 'boolean'
			| 'number'
			| 'string';
	}

	export type BlockAttribute< T > =
		| AttributeSource.Attribute
		| AttributeSource.Children
		| AttributeSource.HTML
		| AttributeSource.Meta
		| AttributeSource.Query< T >
		| AttributeSource.Text
		| AttributeSource.None;

	export type TransformRawSchema = {
		[ k in keyof HTMLElementTagNameMap | '#text' ]?: {
			attributes?: string[] | undefined;
			require?: Array< keyof HTMLElementTagNameMap > | undefined;
			classes?: Array< string | RegExp > | undefined;
			children?: TransformRawSchema | undefined;
		};
	};

	export interface TransformBlock< T extends Record< string, any > > {
		type: 'block';
		priority?: number | undefined;
		blocks: string[];
		isMatch?( attributes: T, block: string | string[] ): boolean;
		isMultiBlock?: boolean | undefined;
		transform( attributes: T ): BlockInstance< Partial< T > >;
	}

	export interface TransformEnter< T extends Record< string, any > > {
		type: 'enter';
		priority?: number | undefined;
		regExp: RegExp;
		transform(): BlockInstance< Partial< T > >;
	}

	export interface TransformFiles< T extends Record< string, any > > {
		type: 'files';
		priority?: number | undefined;
		isMatch?( files: FileList ): boolean;
		transform(
			files: FileList,
			onChange?: ( id: string, attrs: T ) => void
		): BlockInstance< Partial< T > >;
	}

	export interface TransformPrefix< T extends Record< string, any > > {
		type: 'prefix';
		priority?: number | undefined;
		prefix: string;
		transform( content: string ): BlockInstance< Partial< T > >;
	}

	export interface TransformRaw< T extends Record< string, any > > {
		type: 'raw';
		priority?: number | undefined;
		selector?: string | undefined;
		schema?: TransformRawSchema | undefined;
		isMatch?( node: Node ): boolean;
		transform?( node: Node ): BlockInstance< Partial< T > > | void;
	}

	export interface TransformShortcode< T extends Record< string, any > > {
		type: 'shortcode';
		priority?: number | undefined;
		tag: string;
		transform?( attributes: any, match: ShortcodeMatch ): BlockInstance< T >;
		attributes?: any;
	}

	export type Transform< T extends Record< string, any > = Record< string, any > > =
		| TransformBlock< T >
		| TransformEnter< T >
		| TransformFiles< T >
		| TransformPrefix< T >
		| TransformRaw< T >
		| TransformShortcode< T >;

	export type BlockAttributes = Record< string, any >;

	export type InnerBlockTemplate = [ string, BlockAttributes?, InnerBlockTemplate[]? ];

	export type BlockVariationScope = 'block' | 'inserter' | 'transform';

	export interface BlockVariation< Attributes extends BlockAttributes = BlockAttributes > {
		name: string;
		title: string;
		description?: string;
		category?: string;
		icon?: BlockIcon;
		isDefault?: boolean;
		attributes?: Attributes;
		innerBlocks?: BlockInstance | InnerBlockTemplate[];
		example?:
			| BlockExampleInnerBlock
			| {
					attributes: Attributes;
					innerBlocks?: InnerBlockTemplate[];
			  };
		scope?: BlockVariationScope[];
		keywords?: string[];
		isActive?:
			| ( ( blockAttributes: Attributes, variationAttributes: Attributes ) => boolean )
			| string[];
	}

	export function createBlock< T extends Record< string, any > >(
		name: string,
		attributes?: Partial< T >,
		innerBlocks?: BlockInstance[]
	): BlockInstance< T >;

	export function registerBlockType< TAttributes extends Record< string, any > >(
		metadata: BlockConfiguration< TAttributes >,
		settings?: Partial< BlockConfiguration< TAttributes > >
	): Block< TAttributes > | undefined;
	export function registerBlockType< TAttributes extends Record< string, any > >(
		name: string,
		settings: BlockConfiguration< TAttributes >
	): Block< TAttributes > | undefined;
}

declare module '@wordpress/block-editor' {
	import { BlockInstance } from '@wordpress/blocks';
	import { ComponentType, ReactNode } from 'react';
	import { EditorSettings, EditorBlockListSettings } from '../';

	declare namespace BlockEditorProvider {
		interface Props {
			children: ReactNode;
			onChange?( blocks: BlockInstance[] ): void;
			onInput?( blocks: BlockInstance[] ): void;
			settings?: Partial< EditorSettings & EditorBlockListSettings > | undefined;
			useSubRegistry?: boolean | undefined;
			value?: BlockInstance[] | undefined;
		}
	}
	declare const BlockEditorProvider: ComponentType< BlockEditorProvider.Props >;

	declare namespace BlockList {
		interface Props {
			className?: string | undefined;
			renderAppender?(): JSX.Element;
			rootClientId?: string | undefined;
		}
	}
	declare const BlockList: ComponentType< BlockList.Props >;
}

declare module '@wordpress/keyboard-shortcuts' {
	type ShortcutProts = { children: JSX.Element };
	export function ShortcutProvider( props: ShortcutProts ): JSX.Element;
}
