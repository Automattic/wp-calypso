const promo_options = [
	{
		promo_code: 'a0001',
		message: 'WordPress.com your way  — desktop app now available for Mac, Windows, and Linux.'
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
	}
];

export const getRandomPromo = ( ) => {
	return promo_options[ Math.floor( Math.random() * promo_options.length ) ];
};

export const getPromo = ( code ) => {
	promo_options.find( ( item ) => item.promo_code === code );
};
