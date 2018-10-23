/** @format */

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

export const settings = {
	name: 'a8c/maps',
	title: __( 'Map', 'jetpack' ),
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
			<path d="M0 0h24v24H0z" fill="none" />
		</svg>
	),
	category: 'common',
	keywords: [ __( 'map', 'jetpack' ), __( 'jetpack', 'jetpack' ), __( 'atavist', 'jetpack' ) ],
	attributes: {
		align: {
			type: 'string',
		},
		points: {
			type: 'array',
			default: [],
		},
		map_style: {
			type: 'string',
			default: 'default',
		},
		zoom: {
			type: 'integer',
			default: 13,
		},
		map_center: {
			type: 'object',
			default: {
				latitude: 37.7749295,
				longitude: -122.41941550000001,
			},
		},
		marker_color: {
			type: 'string',
			default: 'red',
		},
		api_key: {
			type: 'string',
		},
	},
	styles: {
		default: {
			map_type: 'ROADMAP',
			styles: [
				{
					elementType: 'labels',
					stylers: [
						{
							visibility: 'on',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'simplified',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
			],
		},
		satellite: {
			map_type: 'SATELLITE',
			styles: [
				{
					elementType: 'labels',
					stylers: [
						{
							visibility: 'on',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'simplified',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
			],
		},
		satellite_with_features: {
			map_type: 'HYBRID',
			styles: [
				{
					elementType: 'labels',
					stylers: [
						{
							visibility: 'on',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'simplified',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
			],
		},
		terrain: {
			map_type: 'TERRAIN',
			styles: [
				{
					featureType: 'administrative',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					elementType: 'labels',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'poi',
					stylers: [
						{
							visibility: 'simplified',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'road',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'water',
					elementType: 'labels',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
			],
		},
		terrain_with_features: {
			map_type: 'TERRAIN',
			styles: [
				{
					elementType: 'labels',
					stylers: [
						{
							visibility: 'on',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'simplified',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.icons',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
			],
		},
		black_and_white: {
			map_type: 'ROADMAP',
			styles: [
				{
					stylers: [
						{
							saturation: -100,
						},
					],
				},
				{
					elementType: 'labels',
					stylers: [
						{
							visibility: 'on',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'simplified',
						},
					],
				},
				{
					featureType: 'poi',
					elementType: 'labels.icon',
					stylers: [
						{
							visibility: 'off',
						},
					],
				},
				{
					featureType: 'transit',
					elementType: 'labels.text',
					stylers: [
						{
							visibility: 'simplified',
						},
					],
				},
			],
		},
	},
	map_styleOptions: [
		{
			value: 'default',
			label: __( 'Basic', 'jetpack' ),
		},
		{
			value: 'black_and_white',
			label: __( 'Black and white', 'jetpack' ),
		},
		{
			value: 'satellite',
			label: __( 'Satellite', 'jetpack' ),
		},
		{
			value: 'satellite_with_features',
			label: __( 'Satellite (with features)', 'jetpack' ),
		},
		{
			value: 'terrain',
			label: __( 'Terrain', 'jetpack' ),
		},
		{
			value: 'terrain_with_features',
			label: __( 'Terrain (with features)', 'jetpack' ),
		},
	],
	GOOGLE_MAPS_API_KEY: 'AIzaSyDaj7klnWKpzGx0W5PonA73Dgr68Me8cyg',
	baseClasses: [ 'atavist-block', 'atavist-simple-map' ],
	validAlignments: [ 'left', 'center', 'right', 'wide', 'full' ],
	markerIcon: (
		<svg width="14" height="20" viewBox="0 0 14 20" xmlns="http://www.w3.org/2000/svg">
			<g id="Page-1" fill="none" fillRule="evenodd">
				<g id="outline-add_location-24px" transform="translate(-5 -2)">
					<polygon id="Shape" points="0 0 24 0 24 24 0 24" />
					<path
						d="M12,2 C8.14,2 5,5.14 5,9 C5,14.25 12,22 12,22 C12,22 19,14.25 19,9 C19,5.14 15.86,2 12,2 Z M7,9 C7,6.24 9.24,4 12,4 C14.76,4 17,6.24 17,9 C17,11.88 14.12,16.19 12,18.88 C9.92,16.21 7,11.85 7,9 Z M13,6 L11,6 L11,8 L9,8 L9,10 L11,10 L11,12 L13,12 L13,10 L15,10 L15,8 L13,8 L13,6 Z"
						id="Shape"
						fill="#000"
						fillRule="nonzero"
					/>
				</g>
			</g>
		</svg>
	),
};
