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
			label: translate( 'Classic Blue' ),
			value: 'classic-blue',
			thumbnail: {
				cssClass: 'is-classic-blue',
			},
		},
		{
			label: translate( 'Classic Bright' ),
			value: 'classic-bright',
			thumbnail: {
				cssClass: 'is-classic-bright',
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
