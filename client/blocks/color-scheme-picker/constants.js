/** @format */

export default function( translate ) {
	return [
		{
			label: translate( 'Default' ),
			value: 'default',
			thumbnail: {
				cssClass: 'is-default-theme',
			},
		},
		{
			label: translate( 'Light' ),
			value: 'light',
			thumbnail: {
				cssClass: 'is-light-theme',
			},
		},
		{
			label: translate( 'Dark' ),
			value: 'dark',
			thumbnail: {
				cssClass: 'is-dark-theme',
			},
		},
	];
}
