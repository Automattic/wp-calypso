/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';

export const visibilityOptions = [
	{
		value: 'public',
		label: __( 'Public' ),
		info: __( 'Visible to everyone.' ),
	},
	{
		value: 'private',
		label: __( 'Private' ),
		info: __( 'Only visible to site admins and editors.' ),
	},
	{
		value: 'password',
		label: __( 'Password Protected' ),
		info: __( 'Protected with a password you choose. Only those with the password can view this post.' ),
	},
];
