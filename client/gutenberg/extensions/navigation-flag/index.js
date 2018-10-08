/** @format */

/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, RichText } from '@wordpress/editor';
import { Fragment } from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * Internal dependencies
 */

import './style.scss';
import './editor.scss';
import { CONFIG } from './config.js';
import NavigationFlag from './navigation-flag.js';

registerBlockType( CONFIG.name, {
	title: CONFIG.title,
	icon: CONFIG.icon,
	category: CONFIG.category,
	keywords: CONFIG.keywords,
	attributes: CONFIG.attributes,
	useOnce: true,

	getEditWrapperProps() {
		return { 'data-align': 'full' };
	},

	edit: function( { className, attributes, setAttributes } ) {
		const { footer_text, menu_slug } = attributes;
		const classes = classnames( CONFIG.baseClasses, className );
		return (
			<div className={ className }>
				<NavigationFlag
					admin={ true }
					menu_slug={ menu_slug }
					onChangeMenuSlug={ menu_slug => setAttributes( { menu_slug } ) }
				>
					<article>
						<InnerBlocks templateLock={ 0 } />
					</article>
					<footer className="publication-footer">
						<RichText
							tagName="p"
							value={ footer_text }
							placeholder="Type footer text..."
							onChange={ value => setAttributes( { footer_text: value } ) }
						/>
					</footer>
				</NavigationFlag>
			</div>
		);
	},

	save: function( { className, attributes } ) {
		const { footer_text, menu_slug } = attributes;
		const classes = classnames( CONFIG.baseClasses, className );
		return (
			<div
				className={ classes }
				data-menu_slug={ menu_slug }
			>
				<article>
					<InnerBlocks.Content />
				</article>
				<footer className="publication-footer">{ footer_text }</footer>
			</div>
		);
	}

} );
