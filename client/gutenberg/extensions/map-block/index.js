/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { PanelBody, SelectControl } from '@wordpress/components';
import { RichText, InspectorControls, BlockControls, BlockAlignmentToolbar } from '@wordpress/editor';
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
import Map from './map-component.js';
import Locations from './locations';
import { CONFIG } from './config.js';

registerBlockType( CONFIG.name, {
	title: CONFIG.title,
	icon: CONFIG.icon,
	category: CONFIG.category,
	keywords: CONFIG.keywords,
	attributes: CONFIG.attributes,
	/* TODO: Research why this doesn't work? */
	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( -1 !== CONFIG.validAlignments.indexOf( align ) ) {
			return { 'data-align': align };
		}
	},
	edit: function( { attributes, setAttributes, className } ) {
		const { the_caption, map_style, points, zoom, map_center, focus_mode, marker_color, align } = attributes;
		const updateAlignment = ( value ) => setAttributes( { align: value } );
		const inspectorControls = (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ updateAlignment }
					/>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Map Options' ) }>
						<Locations
							points={ points }
							onChange={ ( value ) => { setAttributes( { points: value } ) } }
						/>
						<SelectControl
							label={ __( 'Map Theme' ) }
							value={ map_style }
							onChange={ ( value ) => { setAttributes( { map_style: value } ) } }
							options={ CONFIG.map_styleOptions }
						/>
						<SelectControl
							label={ __( 'Marker Color' ) }
							value={ marker_color }
						onChange={ ( value ) => { setAttributes( { marker_color: value } ) } }
						options={ CONFIG.marker_colorOptions }
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
		return (
			<Fragment>
				{ inspectorControls }
				<div className={ className }>
					<Map
						map_style={ map_style }
						points={ points }
						zoom={ zoom }
						map_center={ map_center }
						focus_mode={ focus_mode }
						marker_color={ marker_color }
						onSetZoom={ ( value ) => { setAttributes( { zoom: value } ) } }
						api_key={ CONFIG.GOOGLE_MAPS_API_KEY }
					/>
					<RichText
						tagName='p'
						className="atavist-caption"
						value={ the_caption }
						placeholder="Type a caption..."
						onChange={ ( value ) => setAttributes( { the_caption: value } ) }
					/>
				</div>
			</Fragment>
		);
	},
	save: function( { attributes, className } ) {
		const { the_caption, map_style, points, zoom, map_center, focus_mode, marker_color, align } = attributes;
		const atavistAlignClass = ( value ) => {
			switch ( value ) {
				case 'left':
				case 'right':
				case 'center':
				case 'full':
					return 'atavist-block-align-' + value;
				default:
					return 'atavist-block-align-center';
			}
		}
		const classes = classnames(
			CONFIG.baseClasses,
			className,
			atavistAlignClass( align )
		);
		return (
			<div className={ classes }
				data-map_style={ map_style }
				data-points={ JSON.stringify( points ) }
				data-zoom={ zoom }
				data-map_center={ JSON.stringify( map_center ) }
				data-focus_mode={ JSON.stringify( focus_mode ) }
				data-marker_color={ marker_color }
				data-api_key={ CONFIG.GOOGLE_MAPS_API_KEY }
			>
				<div className='map__map-container' />
				<p className="atavist-caption">{ the_caption }</p>
			</div>
		);
	}
} );
