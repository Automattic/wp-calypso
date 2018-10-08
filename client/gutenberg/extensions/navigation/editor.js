/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/editor';

/**
 * External dependencies
 */

import classnames from 'classnames';

 /**
 * Internal dependencies
 */

import './style.scss';
import './editor.scss';
import Navigation from './navigation.js';
import { CONFIG } from './config.js';

const { name, title, icon, category, keywords, attributes, baseClasses } = CONFIG;

registerBlockType( name, {
	title: title,
	icon: icon,
	category: category,
	keywords: keywords,
	attributes: attributes,
	edit: function( { attributes, className } ) {
		const classes = classnames(
			baseClasses,
			className
		);
		return (
			<div className={ classes }>
				<Navigation>
					<article>
						<InnerBlocks />
					</article>
				</Navigation>
			</div>
		);
	},
	save: function( { attributes, className } ) {
		const classes = classnames(
			CONFIG.baseClasses,
			className
		);
		return (
			<div className={ classes }>
				<article>
					<InnerBlocks.Content />
				</article>
			</div>
		);
	}
} );
