/** @format */

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
import config from './config.js';
import StoryIcons from 'gutenberg/extensions/shared/atavist/subcomponents/StoryIcons';

const baseClasses = [ 'nav-wrapper', 'navigation-None' ];

registerBlockType( config.name, {
	title: __( config.title ),
	icon: config.icon,
	category: config.category,
	keywords: config.keywords.map( keyword => __( keyword ) ),
	useOnce: true,
	getEditWrapperProps() {
		return { 'data-align': 'wide' };
	},
	edit: function( { className } ) {
		const classes = classnames( baseClasses, className );
		return (
			<div className={ classes }>
				<div class="nav-icons vertical-nav-icons">
					<div class="story-icons">
						<StoryIcons />
					</div>
				</div>
				<article>
					<InnerBlocks templateLock={ 0 } />
				</article>
			</div>
		);
	},
	save: function( { className } ) {
		const classes = classnames( baseClasses, className );
		return (
			<div className={ classes }>
				<div class="nav-icons vertical-nav-icons">
					<div class="story-icons">
						<StoryIcons />
					</div>
				</div>
				<article>
					<InnerBlocks.Content />
				</article>
			</div>
		);
	},
} );
