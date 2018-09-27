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
import config from './config.js';

const { name, title, icon, category, keywords, attributes, baseClasses } = config;
registerBlockType( name, {
	title: __( title ),
	icon: icon,
	category: category,
	keywords: keywords.map( keyword => __( keyword ) ),
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
			config.baseClasses,
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
