/** @format */

/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

import './editor.scss';
import HoursList from './components/HoursList';

/**
 * Block Registrations:
 */

registerBlockType( 'jetpack/business-hours', {
	title: __( 'Business Hours', 'random-blocks' ),
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path fill="none" d="M0 0h24v24H0V0z" />
			<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
		</svg>
	),
	category: 'widgets',
	supports: {
		html: true,
	},

	attributes: {
		hours: {
			type: 'object',
			default: {
				Sun: {
					opening: '',
					closing: '',
				},
				Mon: {
					opening: '',
					closing: '',
				},
				Tue: {
					opening: '',
					closing: '',
				},
				Wed: {
					opening: '',
					closing: '',
				},
				Thu: {
					opening: '',
					closing: '',
				},
				Fri: {
					opening: '',
					closing: '',
				},
				Sat: {
					opening: '',
					closing: '',
				},
			},
		},
	},

	edit: function( props ) {
		return (
			<HoursList
				hours={ props.attributes.hours }
				setAttributes={ props.setAttributes }
				edit={ true }
			/>
		);
	},

	save: function( props ) {
		return <HoursList hours={ props.attributes.hours } edit={ false } />;
	},
} );
