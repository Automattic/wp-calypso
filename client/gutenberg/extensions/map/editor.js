/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { SelectControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
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
import MapComponent from './map-component.js';
import { CONFIG } from './config.js';

const { name, title, icon, category, keywords, attributes, map_styleOptions, baseClasses } = CONFIG;

registerBlockType( name, {
	title: title,
	icon: icon,
	category: category,
	keywords: keywords,
	attributes: attributes,
	edit: function( { attributes, setAttributes, className } ) {
		const { map_style } = attributes;
		const classes = classnames(
			baseClasses,
			className
		);
		const inspectorControls = (
	  		<InspectorControls>
      			<SelectControl
      				label={ __( 'Map Theme' ) }
      				value={ map_style }
      				onChange={ ( value ) => { setAttributes( { map_style: value } ) } }
      				options={ map_styleOptions }
      			/>
	  		</InspectorControls>
      	);
		return (
			<Fragment>
				{ inspectorControls }
				<div
					className={ classes }
				>
					<MapComponent
						map_style={ map_style }
					/>
				</div>
			</Fragment>
		);
	},
	save: function( { attributes, className } ) {
		const { map_style } = attributes;
		const classes = classnames(
			CONFIG.baseClasses,
			className
		);
		return (
			<div
				className={ classes }
				data-map_style={ map_style }
			/>
		);
	}
} );
