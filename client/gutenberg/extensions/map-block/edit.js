/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import { Component, createRef, Fragment } from '@wordpress/element';
import { IconButton, PanelBody, Toolbar } from '@wordpress/components';
import {
	InspectorControls,
	BlockControls,
	BlockAlignmentToolbar,
	PanelColorSettings,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */

import { settings } from './settings.js';
import AddPoint from './add-point';
import Locations from './locations';
import Map from './component.js';
import MapThemePicker from './map-theme-picker';

class MapEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			addPointVisibility: false,
		};
		this.mapRef = createRef();
	}
	addPoint = ( point ) => {
		const { attributes, setAttributes } = this.props;
		const { points } = attributes;
		const newPoints = points.slice( 0 );
		newPoints.push( point );
		setAttributes( { points: newPoints } );
		this.setState( { addPointVisibility: false } );
	}
	updateAlignment = ( value ) => {
		this.props.setAttributes( { align: value } );
		// Allow one cycle for alignment change to take effect
		setTimeout( this.mapRef.current.sizeMap, 0 );
	}
	render() {
		const { className, setAttributes, attributes } = this.props;
		const { map_style, points, zoom, map_center, marker_color, align } = attributes;
		const { addPointVisibility } = this.state;
		const inspectorControls = (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar value={ align } onChange={ this.updateAlignment } />
					<Toolbar>
						<IconButton
							icon={ settings.markerIcon }
							label="Add a marker"
							onClick={ () => this.setState( { addPointVisibility: true } ) }
						/>
					</Toolbar>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Map Theme', 'jetpack' ) }>
						<MapThemePicker
							value={ map_style }
							onChange={ value => {
								setAttributes( { map_style: value } );
							} }
							options={ settings.map_styleOptions }
						/>
					</PanelBody>
					<PanelColorSettings
						title={ __( 'Colors', 'jetpack' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: marker_color,
								onChange: value => setAttributes( { marker_color: value } ),
								label: 'Marker Color',
							},
						] }
					/>
					{ points.length ? (
						<PanelBody title={ __( 'Markers', 'jetpack' ) }>
							<Locations
								points={ points }
								onChange={ value => {
									setAttributes( { points: value } );
								} }
							/>
						</PanelBody>
					) : null }
				</InspectorControls>
			</Fragment>
		);
		return (
			<Fragment>
				{ inspectorControls }
				<div className={ className }>
					<Map
						ref={ this.mapRef }
						map_style={ map_style }
						points={ points }
						zoom={ zoom }
						map_center={ map_center }
						marker_color={ marker_color }
						onSetZoom={ value => {
							setAttributes( { zoom: value } );
						} }
						api_key={ settings.GOOGLE_MAPS_API_KEY }
						admin={ true }
						onSetPoints={ value => setAttributes( { points: value } ) }
						onMapLoaded={ () => this.setState( { addPointVisibility: true } ) }
						onMarkerClick={ () => this.setState( { addPointVisibility: false } ) }
					>
						{ addPointVisibility && (
							<AddPoint
								onAddPoint={ this.addPoint }
								onClose={ () => this.setState( { addPointVisibility: false } ) }
							/>
						) }
					</Map>
				</div>
			</Fragment>
		);
	}
}

export default MapEdit;
