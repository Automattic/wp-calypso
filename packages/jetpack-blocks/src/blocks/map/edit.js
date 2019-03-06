/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Component, createRef, Fragment } from '@wordpress/element';
import {
	Button,
	ButtonGroup,
	ExternalLink,
	IconButton,
	PanelBody,
	Placeholder,
	Spinner,
	TextControl,
	ToggleControl,
	Toolbar,
	withNotices,
} from '@wordpress/components';
import {
	BlockAlignmentToolbar,
	BlockControls,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import AddPoint from './add-point';
import Locations from './locations';
import Map from './component.js';
import MapThemePicker from './map-theme-picker';
import { __ } from '../../utils/i18n';
import { settings } from './settings.js';

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
	}
	addPoint = point => {
		const { attributes, setAttributes } = this.props;
		const { points } = attributes;
		const newPoints = points.slice( 0 );
		let duplicateFound = false;
		points.map( existingPoint => {
			if ( existingPoint.id === point.id ) {
				duplicateFound = true;
			}
		} );
		if ( duplicateFound ) {
			return;
		}
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
		this.setState( {
			apiKeyControl: value,
		} );
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
	apiCall( serviceApiKey = null, method = 'GET' ) {
		const { noticeOperations } = this.props;
		const { apiKey } = this.state;
		const path = '/wpcom/v2/service-api-keys/mapbox';
		const fetch = serviceApiKey
			? { path, method, data: { service_api_key: serviceApiKey } }
			: { path, method };
		this.setState( { apiRequestOutstanding: true }, () => {
			apiFetch( fetch ).then(
				result => {
					noticeOperations.removeAllNotices();
					this.setState( {
						apiState: result.service_api_key ? API_STATE_SUCCESS : API_STATE_FAILURE,
						apiKey: result.service_api_key,
						apiKeyControl: result.service_api_key,
						apiRequestOutstanding: false,
					} );
				},
				result => {
					this.onError( null, result.message );
					this.setState( {
						apiRequestOutstanding: false,
						apiKeyControl: apiKey,
					} );
				}
			);
		} );
	}
	componentDidMount() {
		this.apiCall();
	}
	onError = ( code, message ) => {
		const { noticeOperations } = this.props;
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	};
	render() {
		const { className, setAttributes, attributes, noticeUI, notices } = this.props;
		const { mapStyle, mapDetails, points, zoom, mapCenter, markerColor, align } = attributes;
		const {
			addPointVisibility,
			apiKey,
			apiKeyControl,
			apiState,
			apiRequestOutstanding,
		} = this.state;
		const inspectorControls = (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ this.updateAlignment }
						controls={ [ 'center', 'wide', 'full' ] }
					/>
					<Toolbar>
						<IconButton
							icon={ settings.markerIcon }
							label="Add a marker"
							onClick={ () => this.setState( { addPointVisibility: true } ) }
						/>
					</Toolbar>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={ __( 'Map Theme' ) }>
						<MapThemePicker
							value={ mapStyle }
							onChange={ value => setAttributes( { mapStyle: value } ) }
							options={ settings.mapStyleOptions }
						/>
						<ToggleControl
							label={ __( 'Show street names' ) }
							checked={ mapDetails }
							onChange={ value => setAttributes( { mapDetails: value } ) }
						/>
					</PanelBody>
					<PanelColorSettings
						title={ __( 'Colors' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: markerColor,
								onChange: value => setAttributes( { markerColor: value } ),
								label: 'Marker Color',
							},
						] }
					/>
					{ points.length ? (
						<PanelBody title={ __( 'Markers' ) } initialOpen={ false }>
							<Locations
								points={ points }
								onChange={ value => {
									setAttributes( { points: value } );
								} }
							/>
						</PanelBody>
					) : null }
					<PanelBody title={ __( 'Mapbox Access Token' ) } initialOpen={ false }>
						<TextControl
							label={ __( 'Mapbox Access Token' ) }
							value={ apiKeyControl }
							onChange={ value => this.setState( { apiKeyControl: value } ) }
						/>
						<ButtonGroup>
							<Button type="button" onClick={ this.updateAPIKey } isDefault>
								{ __( 'Update Token' ) }
							</Button>
							<Button type="button" onClick={ this.removeAPIKey } isDefault>
								{ __( 'Remove Token' ) }
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
		const placeholderAPIStateFailure = (
			<Placeholder icon={ settings.icon } label={ __( 'Map' ) } notices={ notices }>
				<Fragment>
					<div className="components-placeholder__instructions">
						{ __( 'To use the map block, you need an Access Token.' ) }
						<br />
						<ExternalLink href="https://www.mapbox.com">
							{ __( 'Create an account or log in to Mapbox.' ) }
						</ExternalLink>
						<br />
						{ __(
							'Locate and copy the default access token. Then, paste it into the field below.'
						) }
					</div>
					<TextControl
						className="wp-block-jetpack-map-components-text-control-api-key"
						disabled={ apiRequestOutstanding }
						placeholder={ __( 'Paste Token Here' ) }
						value={ apiKeyControl }
						onChange={ this.updateAPIKeyControl }
					/>
					<Button
						className="wp-block-jetpack-map-components-text-control-api-key-submit"
						isLarge
						disabled={ apiRequestOutstanding || ! apiKeyControl || apiKeyControl.length < 1 }
						onClick={ this.updateAPIKey }
					>
						{ __( 'Set Token' ) }
					</Button>
				</Fragment>
			</Placeholder>
		);
		const placeholderAPIStateSuccess = (
			<Fragment>
				{ inspectorControls }
				<div className={ className }>
					<Map
						ref={ this.mapRef }
						mapStyle={ mapStyle }
						mapDetails={ mapDetails }
						points={ points }
						zoom={ zoom }
						mapCenter={ mapCenter }
						markerColor={ markerColor }
						onSetZoom={ value => {
							setAttributes( { zoom: value } );
						} }
						admin={ true }
						apiKey={ apiKey }
						onSetPoints={ value => setAttributes( { points: value } ) }
						onMapLoaded={ () => this.setState( { addPointVisibility: true } ) }
						onMarkerClick={ () => this.setState( { addPointVisibility: false } ) }
						onError={ this.onError }
					>
						{ addPointVisibility && (
							<AddPoint
								onAddPoint={ this.addPoint }
								onClose={ () => this.setState( { addPointVisibility: false } ) }
								apiKey={ apiKey }
								onError={ this.onError }
								tagName="AddPoint"
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
