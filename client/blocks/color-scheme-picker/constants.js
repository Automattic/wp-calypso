/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Image dependencies
 */
import classicBright from 'assets/images/color-schemes/color-scheme-thumbnail-classic-bright.svg';
import classicBlue from 'assets/images/color-schemes/color-scheme-thumbnail-classic-blue.svg';
import powderSnow from 'assets/images/color-schemes/color-scheme-thumbnail-powder-snow.svg';
import Nightfall from 'assets/images/color-schemes/color-scheme-thumbnail-nightfall.svg';
import Sakura from 'assets/images/color-schemes/color-scheme-thumbnail-sakura.svg';
import Ocean from 'assets/images/color-schemes/color-scheme-thumbnail-ocean.svg';
import Sunset from 'assets/images/color-schemes/color-scheme-thumbnail-sunset.svg';
import Midnight from 'assets/images/color-schemes/color-scheme-thumbnail-midnight.svg';
import Contrast from 'assets/images/color-schemes/color-scheme-thumbnail-contrast.svg';

/**
 * !! Note !!
 *
 * Every _value_ present in this list should appear in the colorScheme enum array in
 * `client/state/preferences/schema.js` or preferences state persistence may be invalidated.
 */

export default function( translate ) {
	return compact( [
		{
			label: translate( 'Classic Bright' ),
			value: 'classic-bright',
			thumbnail: {
				cssClass: 'is-classic-bright',
				imageUrl: classicBright,
			},
		},
		{
			label: translate( 'Classic Blue' ),
			value: 'classic-blue',
			thumbnail: {
				cssClass: 'is-classic-blue',
				imageUrl: classicBlue,
			},
		},
		{
			label: translate( 'Powder Snow' ),
			value: 'powder-snow',
			thumbnail: {
				cssClass: 'is-powder-snow',
				imageUrl: powderSnow,
			},
		},
		{
			label: translate( 'Nightfall' ),
			value: 'nightfall',
			thumbnail: {
				cssClass: 'is-nightfall',
				imageUrl: Nightfall,
			},
		},
		{
			label: translate( 'Sakura' ),
			value: 'sakura',
			thumbnail: {
				cssClass: 'is-sakura',
				imageUrl: Sakura,
			},
		},
		{
			label: translate( 'Ocean' ),
			value: 'ocean',
			thumbnail: {
				cssClass: 'is-ocean',
				imageUrl: Ocean,
			},
		},
		{
			label: translate( 'Sunset' ),
			value: 'sunset',
			thumbnail: {
				cssClass: 'is-sunset',
				imageUrl: Sunset,
			},
		},
		{
			label: translate( 'Midnight' ),
			value: 'midnight',
			thumbnail: {
				cssClass: 'is-midnight',
				imageUrl: Midnight,
			},
		},
		{
			label: translate( 'Contrast' ),
			value: 'contrast',
			thumbnail: {
				cssClass: 'is-contrast',
				imageUrl: Contrast,
			},
		},
	] );
}
