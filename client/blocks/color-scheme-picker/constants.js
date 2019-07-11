/** @format */
/**
 * External dependencies
 */
import { compact } from 'lodash';
import config from 'config';

export default function( translate ) {
	return compact( [
		{
			label: translate( 'Classic Bright' ),
			value: 'classic-bright',
			thumbnail: {
				cssClass: 'is-classic-bright',
			},
		},
		{
			label: translate( 'Classic Blue' ),
			value: 'classic-blue',
			thumbnail: {
				cssClass: 'is-classic-blue',
			},
		},
		{
			label: translate( 'Powder Snow' ),
			value: 'powder-snow',
			thumbnail: {
				cssClass: 'is-powder-snow',
			},
		},
		{
			label: translate( 'Nightfall' ),
			value: 'nightfall',
			thumbnail: {
				cssClass: 'is-nightfall',
			},
		},
		{
			label: translate( 'Sakura' ),
			value: 'sakura',
			thumbnail: {
				cssClass: 'is-sakura',
			},
		},
		config.isEnabled( 'me/account/color-schemes/ocean' ) && {
			label: translate( 'Ocean' ),
			value: 'ocean',
			thumbnail: {
				cssClass: 'is-ocean',
			},
		},
		config.isEnabled( 'me/account/color-schemes/sunset' ) && {
			label: translate( 'Sunset' ),
			value: 'sunset',
			thumbnail: {
				cssClass: 'is-sunset',
			},
		},
		config.isEnabled( 'me/account/color-schemes/midnight' ) && {
			label: translate( 'Midnight' ),
			value: 'midnight',
			thumbnail: {
				cssClass: 'is-midnight',
			},
		},
		config.isEnabled( 'me/account/color-schemes/contrast' ) && {
			label: translate( 'Contrast' ),
			value: 'contrast',
			thumbnail: {
				cssClass: 'is-contrast',
			},
		},
	] );
}
