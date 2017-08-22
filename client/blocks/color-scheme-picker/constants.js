/** @format */

export default function( translate ) {
	return [
		{
			label: translate( 'Default' ),
			value: 'default',
			thumbnail: {
				cssClass: 'is-default',
			},
		},
		{
			label: translate( 'Light' ),
			value: 'light',
			thumbnail: {
				cssClass: 'is-light',
			},
		},
		{
			label: translate( 'Dark' ),
			value: 'dark',
			thumbnail: {
				cssClass: 'is-dark',
			},
		},
	];
}
