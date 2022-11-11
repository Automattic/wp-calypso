import { BlockInstance, createBlock, registerBlockType } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { renderToString } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { fetchPageAttributes, SUPPORT_PAGE_PATTERN, SupportPageBlockAttributes } from './block';
import { Edit } from './edit';
import { WordPressIcon } from './icon';
import { Save } from './save';

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
		content: {
			type: 'string',
			source: 'text',
			selector: '.hb-support-page-embed__content',
		},
		title: {
			type: 'string',
			source: 'text',
			selector: '.hb-support-page-embed__title',
		},
		minutesToRead: {
			type: 'number',
		},
	},
	supports: {
		align: true,
		anchor: true,
	},
	edit: Edit,
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
				transform: ( { url }: SupportPageBlockAttributes ) => {
					const link = <a href={ url }>{ url }</a>;
					return createBlock( 'core/paragraph', {
						content: renderToString( link ),
					} );
				},
			},
		],
	},
} );
