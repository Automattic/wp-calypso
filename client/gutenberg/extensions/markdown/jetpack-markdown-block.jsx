/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackMarkdownBlockEditor from './jetpack-markdown-block-editor';
import JetpackMarkdownBlockSave from './jetpack-markdown-block-save';

const { __ } = window.wp.i18n;

const {
	registerBlockType,
} = window.wp.blocks;

registerBlockType( 'jetpack/markdown-block', {

	title: __( 'Markdown' ),

	description: [
		__( 'Write your content in plain-text Markdown syntax.' ),
		(
		<p>
			<a href="https://en.support.wordpress.com/markdown-quick-reference/">
			Support Reference
			</a>
		</p>
		)
	],

	icon: <svg
			xmlns="http://www.w3.org/2000/svg"
			class="dashicon"
			width="20"
			height="20"
			viewBox="0 0 208 128"
			stroke="currentColor"
		>
			<rect
				width="198"
				height="118"
				x="5"
				y="5"
				ry="10"
				stroke-width="10"
				fill="none"
			/>
			<path d="M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z" />
		</svg>,

	category: 'formatting',

	attributes: {
		//The Markdown source is saved in the block content comments delimiter
		source: { type: 'string' }
	},

	edit: JetpackMarkdownBlockEditor,

	save: JetpackMarkdownBlockSave,

} );
