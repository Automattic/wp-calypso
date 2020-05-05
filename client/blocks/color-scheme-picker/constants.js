/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Image dependencies
 */
import classicBrightImg from 'assets/images/color-schemes/color-scheme-thumbnail-classic-bright.svg';
import classicBlueImg from 'assets/images/color-schemes/color-scheme-thumbnail-classic-blue.svg';
import powderSnowImg from 'assets/images/color-schemes/color-scheme-thumbnail-powder-snow.svg';
import nightfallImg from 'assets/images/color-schemes/color-scheme-thumbnail-nightfall.svg';
import sakuraImg from 'assets/images/color-schemes/color-scheme-thumbnail-sakura.svg';
import oceanImg from 'assets/images/color-schemes/color-scheme-thumbnail-ocean.svg';
import sunsetImg from 'assets/images/color-schemes/color-scheme-thumbnail-sunset.svg';
import midnightImg from 'assets/images/color-schemes/color-scheme-thumbnail-midnight.svg';
import contrastImg from 'assets/images/color-schemes/color-scheme-thumbnail-contrast.svg';

/**
 * !! Note !!
 *
 * Every _value_ present in this list should appear in the colorScheme enum array in
 * `client/state/preferences/schema.js` or preferences state persistence may be invalidated.
 */

export default function ( translate ) {
	return compact( [
		{
			label: translate( 'Classic Bright' ),
			value: 'classic-bright',
			thumbnail: {
				cssClass: 'is-classic-bright',
				imageUrl: classicBrightImg,
			},
		},
		{
			label: translate( 'Classic Blue' ),
			value: 'classic-blue',
			thumbnail: {
				cssClass: 'is-classic-blue',
				imageUrl: classicBlueImg,
			},
		},
		{
			label: translate( 'Powder Snow' ),
			value: 'powder-snow',
			thumbnail: {
				cssClass: 'is-powder-snow',
				imageUrl: powderSnowImg,
			},
		},
		{
			label: translate( 'Nightfall' ),
			value: 'nightfall',
			thumbnail: {
				cssClass: 'is-nightfall',
				imageUrl: nightfallImg,
			},
		},
		{
			label: translate( 'Sakura' ),
			value: 'sakura',
			thumbnail: {
				cssClass: 'is-sakura',
				imageUrl: sakuraImg,
			},
		},
		{
			label: translate( 'Ocean' ),
			value: 'ocean',
			thumbnail: {
				cssClass: 'is-ocean',
				imageUrl: oceanImg,
			},
		},
		{
			label: translate( 'Sunset' ),
			value: 'sunset',
			thumbnail: {
				cssClass: 'is-sunset',
				imageUrl: sunsetImg,
			},
		},
		{
			label: translate( 'Midnight' ),
			value: 'midnight',
			thumbnail: {
				cssClass: 'is-midnight',
				imageUrl: midnightImg,
			},
		},
		{
			label: translate( 'Contrast' ),
			value: 'contrast',
			thumbnail: {
				cssClass: 'is-contrast',
				imageUrl: contrastImg,
			},
		},
	] );
}
