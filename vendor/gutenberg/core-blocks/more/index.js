/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit';

export const name = 'core/more';

export const settings = {
	title: __( 'More' ),

	description: __( 'Want to show only part of this post on your blog\'s home page? Insert a "More" block where you want the split.' ),

	icon: 'editor-insertmore',

	category: 'layout',

	supports: {
		customClassName: false,
		className: false,
		html: false,
		multiple: false,
	},

	attributes: {
		customText: {
			type: 'string',
		},
		noTeaser: {
			type: 'boolean',
			default: false,
		},
	},

	transforms: {
		from: [
			{
				type: 'raw',
				schema: {
					'wp-block': { attributes: [ 'data-block' ] },
				},
				isMatch: ( node ) => node.dataset && node.dataset.block === 'core/more',
				transform( node ) {
					const { customText, noTeaser } = node.dataset;
					const attrs = {};
					// Don't copy unless defined and not an empty string
					if ( customText ) {
						attrs.customText = customText;
					}
					// Special handling for boolean
					if ( noTeaser === '' ) {
						attrs.noTeaser = true;
					}
					return createBlock( 'core/more', attrs );
				},
			},
		],
	},

	edit,

	save( { attributes } ) {
		const { customText, noTeaser } = attributes;

		const moreTag = customText ?
			`<!--more ${ customText }-->` :
			'<!--more-->';

		const noTeaserTag = noTeaser ?
			'<!--noteaser-->' :
			'';

		return (
			<RawHTML>
				{ compact( [ moreTag, noTeaserTag ] ).join( '\n' ) }
			</RawHTML>
		);
	},
};
