/** @format */

/**
 * External dependencies
 */

import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const settings = {
	name: 'jetpack/map',
	title: __( 'Map' ),
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
			<path d="M0 0h24v24H0z" fill="none" />
		</svg>
	),
	category: 'jetpack',
	keywords: [ __( 'map' ), __( 'location' ) ],
	attributes: {
		align: {
			type: 'string',
		},
		points: {
			type: 'array',
			default: [],
		},
		mapStyle: {
			type: 'string',
			default: 'default',
		},
		mapDetails: {
			type: 'boolean',
			default: true,
		},
		zoom: {
			type: 'integer',
			default: 13,
		},
		mapCenter: {
			type: 'object',
			default: {
				longitude: -122.41941550000001,
				latitude: 37.7749295,
			},
		},
		markerColor: {
			type: 'string',
			default: 'red',
		},
	},
	mapStyleOptions: [
		{
			value: 'default',
			label: __( 'Basic' ),
		},
		{
			value: 'black_and_white',
			label: __( 'Black and white' ),
		},
		{
			value: 'satellite',
			label: __( 'Satellite' ),
		},
		{
			value: 'terrain',
			label: __( 'Terrain' ),
		},
	],
	validAlignments: [ 'center', 'wide', 'full' ],
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
