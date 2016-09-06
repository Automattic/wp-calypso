import { sample } from 'lodash';

const promo_options = [
	{
		promo_code: 'a0001',
		message: 'WordPress.com your way — desktop app now available for Mac, Windows, and Linux.'
	},
	{
		promo_code: 'a0002',
		message: 'Get WordPress.com app for your desktop.'
	},
	{
		promo_code: 'a0003',
		message: 'WordPress.com app now available for desktop.'
	},
	{
		promo_code: 'a0005',
		message: 'WordPress.com at your fingertips — download app for desktop.'
	},
	{
		promo_code: 'a0006',
		message: 'WordPress.com in the palm of your hands — download app for mobile.'
	}
];

export const getRandomPromo = ( ) => sample ( promo_options );

export const getPromoLink = ( location, promoCode ) => {
	const promoType = 'a0006' === promoCode
		? 'desktop'
		: 'mobile';

	return `https://apps.wordpress.com/${ promoType }/?ref=promo_${ location }_${ promoCode }`;
};
