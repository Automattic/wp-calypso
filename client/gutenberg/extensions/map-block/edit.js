/** @format */

/**
 * External dependencies
 */

import { __, sprintf } from '@wordpress/i18n';
import { Component, createRef, Fragment, RawHTML } from '@wordpress/element';
import {
	Button,
	ButtonGroup,
	IconButton,
	PanelBody,
	Placeholder,
	Spinner,
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
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */

import { settings } from './settings.js';
import AddPoint from './add-point';
import Locations from './locations';
import Map from './component.js';
import MapThemePicker from './map-theme-picker';

const API_STATE_LOADING = 0;
const API_STATE_FAILURE = 1;
const API_STATE_SUCCESS = 2;

class MapEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			addPointVisibility: false,
			apiState: API_STATE_LOADING,
		};
		this.mapRef = createRef();
		this.debouncedUpdateAPIKey = debounce( this.updateAPIKey, 800 );
	}
	componentWillUnmount() {
		this.debouncedAPIKey.cancel();
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
	updateAPIKeyControl = value => {
		this.setState( { apiKeyControl: value }, this.debouncedUpdateAPIKey );
	};
	updateAPIKey = () => {
		const { noticeOperations } = this.props;
		const { apiKeyControl } = this.state;
		noticeOperations.removeAllNotices();
		apiKeyControl && this.apiCall( apiKeyControl, 'POST' );
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
					apiState: result.api_key ? API_STATE_SUCCESS : API_STATE_FAILURE,
					api_key: result.api_key,
					apiKeyControl: result.api_key,
				} );
			} )
			.catch( result => {
				noticeOperations.removeAllNotices();
				noticeOperations.createErrorNotice( result.message );
				this.setState( {
					apiState: API_STATE_FAILURE,
				} );
			} );
	}
	componentDidMount() {
		this.apiCall();
	}
	render() {
		const { className, setAttributes, attributes, noticeUI, notices } = this.props;
		const { map_style, points, zoom, map_center, marker_color, align } = attributes;
		const { addPointVisibility, api_key, apiKeyControl, apiState } = this.state;
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
						<PanelBody title={ __( 'Markers', 'jetpack' ) } initialOpen={ false }>
							<Locations
								points={ points }
								onChange={ value => {
									setAttributes( { points: value } );
								} }
							/>
						</PanelBody>
					) : null }
					<PanelBody title={ __( 'Google Maps API Key', 'jetpack' ) } initialOpen={ false }>
						<TextControl
							value={ apiKeyControl }
							onChange={ value => this.setState( { apiKeyControl: value } ) }
						/>
						<ButtonGroup>
							<Button type="button" onClick={ this.updateAPIKey } isSmall isDefault>
								{ __( 'Update Key' ) }
							</Button>
							<Button type="button" onClick={ this.removeAPIKey } isSmall isDangerous>
								{ __( 'Remove Key' ) }
							</Button>
						</ButtonGroup>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
		const placholderAPIStateLoading = (
			<Placeholder icon={ settings.icon }>
				<Spinner />
			</Placeholder>
		);
		const getAPIInstructions = sprintf(
			"This is your first map block. You need to get a Google Maps API key. <a href='%s' target='_blank'>Here's how to do it</a>.",
			'https://developers.google.com/maps/documentation/javascript/get-api-key'
		);
		const placeholderAPIStateFailure = (
			<Placeholder icon={ settings.icon } label={ __( 'Map', 'jetpack' ) } notices={ notices }>
				<Fragment>
					<div className="components-placeholder__instructions">
						<RawHTML>{ getAPIInstructions }</RawHTML>
					</div>
					<TextControl
						placeholder="Paste Key Here"
						value={ apiKeyControl }
						onChange={ this.updateAPIKeyControl }
					/>
				</Fragment>
			</Placeholder>
		);
		const placeholderAPIStateSuccess = (
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
		return (
			<Fragment>
				{ noticeUI }
				{ apiState === API_STATE_LOADING && placholderAPIStateLoading }
				{ apiState === API_STATE_FAILURE && placeholderAPIStateFailure }
				{ apiState === API_STATE_SUCCESS && placeholderAPIStateSuccess }
			</Fragment>
		);
	}
}

export default withNotices( MapEdit );
