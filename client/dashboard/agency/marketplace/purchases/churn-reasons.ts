import { __ } from '@wordpress/i18n';

// The values are what the survey backend reports on, so they match classic's.
export const getChurnReasons = () => [
	{
		label: __( "It had bugs and didn't work for us" ),
		value: 'it-had-bugs-and-didnt-work-for-us',
	},
	{ label: __( 'It was the wrong product' ), value: 'it-was-the-wrong-product' },
	{ label: __( 'I was just trying it out' ), value: 'i-was-just-trying-it-out' },
	{ label: __( 'My client no longer needs it' ), value: 'my-client-no-longer-needs-it' },
	{ label: __( 'Other' ), value: 'other' },
];
