/** @format */

/**
 * External dependencies
 */
import { Path } from '@wordpress/components';
/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import renderMaterialIcon from 'gutenberg/extensions/presets/jetpack/utils/render-material-icon';

import './editor.scss';
import HoursList from './components/hours-list';

/**
 * Block Registrations:
 */

export const name = 'business-hours';

export const settings = {
	title: __( 'Business Hours' ),
	icon: renderMaterialIcon(
		<Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
	),
	category: 'widgets',
	supports: {
		html: true,
	},

	attributes: {
		hours: {
			type: 'object',
			default: {
				Sun: [], // closed by default
				Mon: [
					{
						opening: '',
						closing: '',
					},
				],
				Tue: [
					{
						opening: '',
						closing: '',
					},
				],
				Wed: [
					{
						opening: '',
						closing: '',
					},
				],
				Thu: [
					{
						opening: '',
						closing: '',
					},
				],
				Fri: [
					{
						opening: '',
						closing: '',
					},
				],
				Sat: [], // closed by default
			},
		},
	},

	edit: props => (
		<HoursList
			hours={ props.attributes.hours }
			setAttributes={ props.setAttributes }
			edit={ true }
		/>
	),

	save: props => <HoursList hours={ props.attributes.hours } edit={ false } />,
};
