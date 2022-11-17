import { BlockEditProps, BlockInstance, createBlock, registerBlockType } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { renderToString } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	fetchPageAttributes,
	FORUM_TOPIC_PATTERN,
	SUPPORT_PAGE_PATTERN,
	SupportContentBlockAttributes,
} from './block';
import { Edit } from './edit';
import { WordPressIcon } from './icon';
import { Save } from './save';

/**
 * Block variation for support pages
 */
registerBlockType( 'happy-blocks/support-page', {
	title: __( 'WordPress Guide', 'happy-blocks' ),
	icon: <WordPressIcon variant="small" />,
	category: 'embed',
	description: __( 'Embed a page from the WordPress Guide', 'happy-blocks' ),
	keywords: [ __( 'guide' ), __( 'support' ), __( 'how to' ), __( 'howto' ) ],
	attributes: {
		url: {
			type: 'string',
		},
		title: {
			type: 'string',
			source: 'text',
			selector: '.hb-support-page-embed__title',
		},
		content: {
			type: 'string',
			source: 'text',
			selector: '.hb-support-page-embed__content',
		},
		minutesToRead: {
			type: 'number',
		},
	},
	supports: {
		align: true,
		anchor: true,
	},
	edit: ( props: BlockEditProps< SupportContentBlockAttributes > ) => (
		<Edit
			urlPattern={ SUPPORT_PAGE_PATTERN }
			fieldLabel={ __( 'WordPress Guide page URL', 'happy-blocks' ) }
			{ ...props }
		/>
	),
	save: Save,
	transforms: {
		from: [
			{
				type: 'raw',
				isMatch: ( node: Element ): boolean => {
					if ( node.nodeName !== 'P' ) {
						return false;
					}

					const nodeText = node.textContent?.trim() ?? '';
					return SUPPORT_PAGE_PATTERN.test( nodeText );
				},
				transform: ( node: Element ): BlockInstance => {
					const nodeText = node.textContent?.trim() ?? '';

					const block = createBlock( 'happy-blocks/support-page', {
						url: nodeText,
					} );

					fetchPageAttributes( nodeText ).then( ( attributes ) => {
						dispatch( 'core/block-editor' ).updateBlockAttributes( block.clientId, attributes );
					} );

					return block;
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { url }: SupportContentBlockAttributes ) => {
					const link = <a href={ url }>{ url }</a>;
					return createBlock( 'core/paragraph', {
						content: renderToString( link ),
					} );
				},
			},
		],
	},
} );

/**
 * Block variation for support pages
 */
registerBlockType( 'happy-blocks/forum-topic', {
	title: __( 'WordPress Forum', 'happy-blocks' ),
	icon: <WordPressIcon variant="small" />,
	category: 'embed',
	description: __( 'Embed a topic from the WordPress Forums', 'happy-blocks' ),
	keywords: [ __( 'forum' ), __( 'topic' ) ],
	attributes: {
		url: {
			type: 'string',
		},
		title: {
			type: 'string',
			source: 'text',
			selector: '.hb-support-page-embed__title',
		},
		content: {
			type: 'string',
			source: 'text',
			selector: '.hb-support-page-embed__content',
		},
	},
	supports: {
		align: true,
		anchor: true,
	},
	edit: ( props: BlockEditProps< SupportContentBlockAttributes > ) => (
		<Edit
			urlPattern={ FORUM_TOPIC_PATTERN }
			fieldLabel={ __( 'WordPress Forums topic URL', 'happy-blocks' ) }
			{ ...props }
		/>
	),
	save: Save,
	transforms: {
		from: [
			{
				type: 'raw',
				isMatch: ( node: Element ): boolean => {
					if ( node.nodeName !== 'P' ) {
						return false;
					}

					const nodeText = node.textContent?.trim() ?? '';
					return FORUM_TOPIC_PATTERN.test( nodeText );
				},
				transform: ( node: Element ): BlockInstance => {
					const nodeText = node.textContent?.trim() ?? '';

					const block = createBlock( 'happy-blocks/forum-topic', {
						url: nodeText,
					} );

					fetchPageAttributes( nodeText ).then( ( attributes ) => {
						dispatch( 'core/block-editor' ).updateBlockAttributes( block.clientId, attributes );
					} );

					return block;
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/paragraph' ],
				transform: ( { url }: SupportContentBlockAttributes ) => {
					const link = <a href={ url }>{ url }</a>;
					return createBlock( 'core/paragraph', {
						content: renderToString( link ),
					} );
				},
			},
		],
	},
} );
