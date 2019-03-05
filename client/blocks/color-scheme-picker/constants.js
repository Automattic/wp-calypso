/** @format */
/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
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
		config.isEnabled( 'me/account/color-schemes/powder-snow' ) && {
			label: translate( 'Powder Snow' ),
			value: 'powder-snow',
			thumbnail: {
				cssClass: 'is-powder-snow',
			},
		},
		config.isEnabled( 'me/account/color-schemes/nightfall' ) && {
			label: translate( 'Nightfall' ),
			value: 'nightfall',
			thumbnail: {
				cssClass: 'is-nightfall',
			},
		},
		config.isEnabled( 'me/account/color-schemes/sakura' ) && {
			label: translate( 'Sakura' ),
			value: 'sakura',
			thumbnail: {
				cssClass: 'is-sakura',
			},
		},
		config.isEnabled( 'me/account/color-schemes/laser-black' ) && {
			label: translate( 'Laser Black' ),
			value: 'laser-black',
			thumbnail: {
				cssClass: 'is-laser-black',
			},
		},
	] );
}
