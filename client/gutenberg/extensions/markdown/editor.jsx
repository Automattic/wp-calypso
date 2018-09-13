/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { ExternalLink } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import save from './save';

registerBlockType( 'a8c/markdown', {
	title: __( 'Markdown' ),

	description: (
		<Fragment>
			<p>{ __( 'Write your content in plain-text Markdown syntax.' ) }</p>
			<ExternalLink href="https://en.support.wordpress.com/markdown-quick-reference/">
				{ __( 'Support reference' ) }
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
				stroke="#000"
				strokeWidth="10"
				fill="none"
			/>
			<path d="M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z" />
		</svg>
	),

	category: 'formatting',

	attributes: {
		//The Markdown source is saved in the block content comments delimiter
		source: { type: 'string' },
	},

	edit,

	save,
} );
