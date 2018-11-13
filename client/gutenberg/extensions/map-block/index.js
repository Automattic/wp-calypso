/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import {
	IconButton,
	PanelBody,
	Toolbar
} from '@wordpress/components';

import {
	InspectorControls,
	BlockControls,
	BlockAlignmentToolbar,
	PanelColorSettings
} from '@wordpress/editor';

import {
	Fragment,
	createRef
} from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';

 /**
 * Internal dependencies
 */

import { CONFIG } from './config.js';
import Locations from './locations';
import Map from './map-component.js';
import MapThemePicker from './map-theme-picker';

import './style.scss';
import './editor.scss';

registerBlockType( CONFIG.name, {
	title: CONFIG.title,
	icon: CONFIG.icon,
	category: CONFIG.category,
	keywords: CONFIG.keywords,
	attributes: CONFIG.attributes,
	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( -1 !== CONFIG.validAlignments.indexOf( align ) ) {
			return { 'data-align': align };
		}
	},
	edit: function( { attributes, setAttributes, className } ) {
		const {
			map_style,
			points,
			zoom,
			map_center,
			marker_color,
			align
		} = attributes;
		const mapRef = createRef();
		const updateAlignment = ( value ) => {
			setAttributes( { align: value } )
			// Allow one cycle for alignment change to take effect
			setTimeout( mapRef.current.sizeMap, 0);
		};
		const markerIcon = CONFIG.markerIcon;
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
					<PanelBody title={ __( 'Map Theme' ) }>
						<MapThemePicker
							value={ map_style }
							onChange={ ( value ) => { setAttributes( { map_style: value } ) } }
							options={ CONFIG.map_styleOptions }
						/>
					</PanelBody>
					<PanelColorSettings
						title={ __( 'Colors' ) }
						initialOpen={ true }
						colorSettings={ [ {
							value: marker_color,
							onChange: ( value ) => setAttributes( { marker_color: value } ),
							label: 'Marker Color'
						} ] }
					/>
					{ points.length ?
					<PanelBody title={ __( 'Markers' ) }>
						<Locations
							points={ points }
							onChange={ ( value ) => { setAttributes( { points: value } ) } }
						/>
					</PanelBody>
					: null}
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
						marker_color={ marker_color }
						onSetZoom={ ( value ) => { setAttributes( { zoom: value } ) } }
						api_key={ CONFIG.GOOGLE_MAPS_API_KEY }
						admin={ true }
						onSetPoints={ ( value ) => {
							setAttributes( { points: value } )
						} }
					/>
				</div>
			</Fragment>
		);
	},
	save: function( { attributes, className } ) {
		const { map_style, points, zoom, map_center, marker_color, align } = attributes;
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
				data-marker_color={ marker_color }
				data-api_key={ CONFIG.GOOGLE_MAPS_API_KEY }
			>
				<div className='map__map-container' />
			</div>
		);
	}
} );
