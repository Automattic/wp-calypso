/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */

 /**
 * Internal dependencies
 */

export const CONFIG = {
	name: 'atavist/maps',
	title: __( 'Map' ),
	icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/><path d="M0 0h24v24H0z" fill="none"/></svg>,
	category: 'common',
	keywords: [
		__( 'Map' ),
		__( 'Atavist' )
	],
	attributes: {
		align: {
			type: 'string'
		},
		the_caption: {
			source: 'text',
			selector: '.atavist-caption'
		},
		points: {
			type: 'array',
			default: []
		},
		map_style: {
			type: 'string',
			default: 'default'
		},
		zoom: {
			type: 'integer',
			default: 13
		},
		map_center: {
			type: 'object',
			default: {
				latitude: 40.7022937,
				longitude: -73.9863515
			}
		},
		focus_mode: {
			type: 'object',
			default: {
				type: 'fit_markers'
			}
		},
		marker_color: {
			type: 'string',
			default: 'red'
		},
		api_key: {
			type: 'string'
		}
	},
	styles: {
		default: {
			map_type: 'ROADMAP',
			styles: [
				{
					elementType: 'labels',
					stylers: [ {
						visibility: 'on'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'simplified'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'off'
					} ]
				}
			]
		},
		satellite: {
			map_type: 'SATELLITE',
			styles: [
				{
					elementType: 'labels',
					stylers: [ {
						visibility: 'on'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'simplified'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'off'
					} ]
				}
			]
		},
		satellite_with_features: {
			map_type: 'HYBRID',
			styles: [
				{
					elementType: 'labels',
					stylers: [ {
						visibility: 'on'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'simplified'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'off'
					} ]
				}
			]
		},
		terrain: {
			map_type: 'TERRAIN',
			styles: [
				{
					featureType: 'administrative',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					elementType: 'labels',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'poi',
					stylers: [ {
						visibility: 'simplified'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'road',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'water',
					elementType: 'labels',
					stylers: [ {
						visibility: 'off'
					} ]
				}
			]
		},
		terrain_with_features: {
			map_type: 'TERRAIN',
			styles: [
				{
					elementType: 'labels',
					stylers: [ {
						visibility: 'on'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'simplified'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'off'
					} ]
				}
			]
		},
		black_and_white: {
			map_type: 'ROADMAP',
			styles: [
				{
					stylers: [ {
						saturation: -100
					} ]
				},
				{
					elementType: 'labels',
					stylers: [ {
						visibility: 'on'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'simplified'
					} ]
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [ {
						visibility: 'off'
					} ]
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [ {
						visibility: 'simplified'
					} ]
				}
			]
		}
	},
	map_styleOptions: [
		{
			value: 'default',
			label: 'Basic'
		},
		{
			value: 'black_and_white',
			label: 'Black and white'
		},
		{
			value: 'satellite',
			label: 'Satellite'
		},
		{
			value: 'satellite_with_features',
			label: 'Satellite (with features)'
		},
		{
			value: 'terrain',
			label: 'Terrain'
		},
		{
			value: 'terrain_with_features',
			label: 'Terrain (with features)'
		}
	],
	marker_colorOptions: [
		{ name: 'red', color: 'red' },
		{ name: 'blue', color: 'blue' },
		{ name: 'yellow', color: 'yellow' },
		{ name: 'green', color: 'green' },
		{ name: 'purple', color: 'purple' },
		{ name: 'black', color: 'black' }
	],
	GOOGLE_MAPS_API_KEY: 'AIzaSyDaj7klnWKpzGx0W5PonA73Dgr68Me8cyg',
	baseClasses: [
		'atavist-block',
		'atavist-simple-map'
	],
	validAlignments: [
		'left',
		'center',
		'right',
		'wide',
		'full'
	]
};
