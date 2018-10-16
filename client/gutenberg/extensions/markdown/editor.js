/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { ExternalLink } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import edit from './edit';
import save from './save';
import requireConnection from 'gutenberg/extensions/jetpack/require-connection';
import requireModules from 'gutenberg/extensions/jetpack/require-modules';

/**
 * @TODO Jetpack specific registerBlockType wrapper
 *
 * Individual blocks could be declarative about their needs. A block could export:
 *   - Its register block definition, the second arg to `@wordpress/blocks` `registerBlockType`.
 *   - Some spec about its requirements like:
 *       {
 *         modules: [ 'markdown' ],
 *         connection: {
 *           allowDevMode: true,
 *         }
 *       }
 *
 *    - We might, then, have 2 presets for Calypso and WP Admin that detect the
 */

const title = __( 'Markdown', 'jetpack' );

registerBlockType( 'jetpack/markdown', {
	title: __( 'Markdown', 'jetpack' ),

	description: (
		<Fragment>
			<p>
				{ __(
					'Use regular characters and punctuation to style text, links, and lists.',
					'jetpack'
				) }
			</p>
			<ExternalLink href="https://en.support.wordpress.com/markdown-quick-reference/">
				{ __( 'Support reference', 'jetpack' ) }
			</ExternalLink>
		</Fragment>
	),

	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 128">
			<rect
				width="198"
				height="118"
				x="5"
				y="5"
				ry="10"
				stroke="currentColor"
				strokeWidth="10"
				fill="none"
			/>
			<path d="M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z" />
		</svg>
	),

	category: 'jetpack',

	keywords: [ __( 'formatting', 'jetpack' ), __( 'syntax', 'jetpack' ), __( 'markup', 'jetpack' ) ],

	attributes: {
		//The Markdown source is saved in the block content comments delimiter
		source: { type: 'string' },
	},

	edit: compose(
		requireConnection( { blockName: title, allowDevMode: true } ),
		requireModules( [ 'markdown' ] )
	)( edit ),

	save,
} );
