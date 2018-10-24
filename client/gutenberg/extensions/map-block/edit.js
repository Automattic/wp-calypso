/** @format */

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import { Component, createRef, Fragment } from '@wordpress/element';
import {
	Button,
	IconButton,
	PanelBody,
	Toolbar,
	TextControl,
	withNotices,
} from '@wordpress/components';
import {
	InspectorControls,
	BlockControls,
	BlockAlignmentToolbar,
	PanelColorSettings,
} from '@wordpress/editor';
import apiFetch from '@wordpress/api-fetch';

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
	addPoint = point => {
		const { attributes, setAttributes } = this.props;
		const { points } = attributes;
		const newPoints = points.slice( 0 );
		newPoints.push( point );
		setAttributes( { points: newPoints } );
		this.setState( { addPointVisibility: false } );
	};
	updateAlignment = value => {
		this.props.setAttributes( { align: value } );
		// Allow one cycle for alignment change to take effect
		setTimeout( this.mapRef.current.sizeMap, 0 );
	};
	updateAPIKey = () => {
		const { apiKeyControl } = this.state;
		this.apiCall( apiKeyControl, 'POST' );
	};
	removeAPIKey = () => {
		this.apiCall( null, 'DELETE' );
	};
	apiCall( api_key = null, method = 'GET' ) {
		const { noticeOperations } = this.props;
		const url = '/wp-json/jetpack/v4/api-key/googlemaps';
		const fetch = api_key ? { url, method, data: { api_key } } : { url, method };
		apiFetch( fetch )
			.then( result => {
				noticeOperations.removeAllNotices();
				this.setState( {
					api_key: result.api_key,
					apiKeyControl: result.api_key,
				} );
			} )
			.catch( result => {
				noticeOperations.removeAllNotices();
				noticeOperations.createErrorNotice( result.message );
			} );
	}
	componentDidMount() {
		this.apiCall();
	}
	render() {
		const { className, setAttributes, attributes, noticeUI } = this.props;
		const { map_style, points, zoom, map_center, marker_color, align } = attributes;
		const { addPointVisibility, api_key, apiKeyControl } = this.state;
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
					<TextControl
						label={ __( 'Google Maps API Key' ) }
						value={ apiKeyControl }
						onChange={ value => this.setState( { apiKeyControl: value } ) }
					/>
					<Button type="button" onClick={ this.updateAPIKey } isSmall isDefault>
						{ __( 'Update Key' ) }
					</Button>
					<Button type="button" onClick={ this.removeAPIKey } isSmall isDangerous>
						{ __( 'Remove Key' ) }
					</Button>
				</InspectorControls>
			</Fragment>
		);
		return (
			<Fragment>
				{ noticeUI }
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
						admin={ true }
						api_key={ api_key }
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

export default withNotices( MapEdit );
