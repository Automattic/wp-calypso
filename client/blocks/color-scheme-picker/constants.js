/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Image dependencies
 */
import classicBrightImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-classic-bright.svg';
import classicDarkImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-classic-dark.svg';
import classicBlueImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-classic-blue.svg';
import blueImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-blue.svg';
import powderSnowImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-powder-snow.svg';
import lightImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-light.svg';
import modernImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-modern.svg';
import nightfallImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-nightfall.svg';
import sakuraImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-sakura.svg';
import oceanImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-ocean.svg';
import aquaticImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-aquatic.svg';
import sunriseImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-sunrise.svg';
import sunsetImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-sunset.svg';
import midnightImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-midnight.svg';
import coffeeImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-coffee.svg';
import contrastImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-contrast.svg';
import ectoplasmImg from 'calypso/assets/images/color-schemes/color-scheme-thumbnail-ectoplasm.svg';

/**
 * !! Note !!
 *
 * Every _value_ present in this list should appear in the colorScheme enum array in
 * `client/state/preferences/schema.js` or preferences state persistence may be invalidated.
 */

export default function ( translate ) {
	return compact( [
		{
			label: translate( 'Aquatic' ),
			value: 'aquatic',
			thumbnail: {
				cssClass: 'is-aquatic',
				imageUrl: aquaticImg,
			},
		},
		{
			label: translate( 'Blue' ),
			value: 'blue',
			thumbnail: {
				cssClass: 'is-blue',
				imageUrl: blueImg,
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
			label: translate( 'Classic Bright' ),
			value: 'classic-bright',
			thumbnail: {
				cssClass: 'is-classic-bright',
				imageUrl: classicBrightImg,
			},
		},
		{
			label: translate( 'Classic Dark' ),
			value: 'classic-dark',
			thumbnail: {
				cssClass: 'is-classic-dark',
				imageUrl: classicDarkImg,
			},
		},
		{
			label: translate( 'Coffee' ),
			value: 'coffee',
			thumbnail: {
				cssClass: 'is-coffee',
				imageUrl: coffeeImg,
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
		{
			label: translate( 'Ectoplasm', { context: 'admin color scheme' } ),
			value: 'ectoplasm',
			thumbnail: {
				cssClass: 'is-ectoplasm',
				imageUrl: ectoplasmImg,
			},
		},
		{
			label: translate( 'Light' ),
			value: 'light',
			thumbnail: {
				cssClass: 'is-light',
				imageUrl: lightImg,
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
			label: translate( 'Modern' ),
			value: 'modern',
			thumbnail: {
				cssClass: 'is-modern',
				imageUrl: modernImg,
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
			label: translate( 'Ocean' ),
			value: 'ocean',
			thumbnail: {
				cssClass: 'is-ocean',
				imageUrl: oceanImg,
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
			label: translate( 'Sakura' ),
			value: 'sakura',
			thumbnail: {
				cssClass: 'is-sakura',
				imageUrl: sakuraImg,
			},
		},
		{
			label: translate( 'Sunrise' ),
			value: 'sunrise',
			thumbnail: {
				cssClass: 'is-sunrise',
				imageUrl: sunriseImg,
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
	] );
}
