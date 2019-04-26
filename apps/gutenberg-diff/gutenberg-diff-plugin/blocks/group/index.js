/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Path, SVG } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InnerBlocks, getColorClassName } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import edit from './edit';
import { registerBlockType } from '@wordpress/blocks';

import './style.scss';

export const name = 'gutenberg-diff/group';

export const settings = {
	title: __( 'Group' ),

	icon: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<Path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" />
			<Path d="M0 0h24v24H0z" fill="none" />
		</SVG>
	),

	category: 'layout',

	description: __( 'A wrapping group acting as a container for other blocks.' ),

	keywords: [ __( 'container' ), __( 'wrapper' ), __( 'row' ) ],

	supports: {
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
	},

	attributes: {
		backgroundColor: {
			type: 'string',
		},
		customBackgroundColor: {
			type: 'string',
		},
	},

	edit,

	save( { attributes } ) {
		const { backgroundColor, customBackgroundColor } = attributes;

		const backgroundClass = getColorClassName( 'background-color', backgroundColor );
		const className = classnames( backgroundClass, {
			'has-background': backgroundColor || customBackgroundColor,
		} );

		const styles = {
			backgroundColor: backgroundClass ? undefined : customBackgroundColor,
		};

		return (
			<div className={ className } style={ styles }>
				<InnerBlocks.Content />
			</div>
		);
	},
};

registerBlockType( 'gutenberg-diff/group', settings );
