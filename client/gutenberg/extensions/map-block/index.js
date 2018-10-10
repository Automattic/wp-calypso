/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

import {
	Button,
	IconButton,
	PanelBody,
	SelectControl,
	Toolbar
} from '@wordpress/components';

import {
	RichText,
	InspectorControls,
	BlockControls,
	BlockAlignmentToolbar
} from '@wordpress/editor';

import { Fragment, createRef } from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';
import { clone } from 'lodash';

 /**
 * Internal dependencies
 */

import './style.scss';
import './editor.scss';
import Locations from './locations';
import Map from './map-component.js';
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
		const markerIcon = <svg width='14' height='20' viewBox='0 0 14 20' xmlns='http://www.w3.org/2000/svg'><g id='Page-1' fill='none' fillRule='evenodd'><g id='outline-add_location-24px' transform='translate(-5 -2)'><polygon id='Shape' points='0 0 24 0 24 24 0 24' /><path d='M12,2 C8.14,2 5,5.14 5,9 C5,14.25 12,22 12,22 C12,22 19,14.25 19,9 C19,5.14 15.86,2 12,2 Z M7,9 C7,6.24 9.24,4 12,4 C14.76,4 17,6.24 17,9 C17,11.88 14.12,16.19 12,18.88 C9.92,16.21 7,11.85 7,9 Z M13,6 L11,6 L11,8 L9,8 L9,10 L11,10 L11,12 L13,12 L13,10 L15,10 L15,8 L13,8 L13,6 Z' id='Shape' fill='#000' fillRule='nonzero' /></g></g></svg>;
		const mapRef = createRef();
		const inspectorControls = (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ updateAlignment }
					/>
					<Toolbar>
						<IconButton
							icon={ markerIcon }
							label='Add a marker'
							onClick={ () => mapRef.current.setAddPointVisibility( true ) }
						/>
					</Toolbar>
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
						ref={ mapRef }
						map_style={ map_style }
						points={ points }
						zoom={ zoom }
						map_center={ map_center }
						focus_mode={ focus_mode }
						marker_color={ marker_color }
						onSetZoom={ ( value ) => { setAttributes( { zoom: value } ) } }
						api_key={ CONFIG.GOOGLE_MAPS_API_KEY }
						admin={ true }
						onSetPoints={ ( value ) => {
							setAttributes( { points: value } )
						} }
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
