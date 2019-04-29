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
		{
			label: translate( 'Sunset' ),
			value: 'sunset',
			thumbnail: {
				cssClass: 'is-sunset',
			},
		},
	] );
}
