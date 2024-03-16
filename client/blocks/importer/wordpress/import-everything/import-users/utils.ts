import { translate } from 'i18n-calypso';
import type { Member } from '@automattic/data-stores';

export const getNameOrEmail = ( user: Member ) => {
	let name;

	if ( user.linked_user_ID ) {
		name = user.linked_user_info?.name;
	} else if ( user.name ) {
		name = user.name;
	} else if ( user.first_name && user.last_name ) {
		name = user.first_name + ' ' + user.last_name;
	} else if ( user.nice_name ) {
		name = user.nice_name;
	} else if ( user.login ) {
		name = user.login;
	}

	return name;
};

export const getRole = ( user: Member ) => {
	if ( ! user ) {
		return 'subscriber';
	}

	if ( ! user.roles && user.date_subscribed ) {
		return user.login ? 'follower' : 'email-subscriber';
	}

	if ( user && user.roles && user.roles[ 0 ] ) {
		return user.roles[ 0 ];
	}

	return 'follower';
};

export const getRoleBadgeText = ( role: string | undefined ) => {
	if ( ! role ) {
		return null;
	}

	let text;
	switch ( role ) {
		case 'super-admin':
			text = translate( 'Super Admin', {
				context: 'Noun: A user role displayed in a badge',
			} );
			break;
		case 'administrator':
			text = translate( 'Admin', {
				context: 'Noun: A user role displayed in a badge',
			} );
			break;
		case 'editor':
			text = translate( 'Editor', {
				context: 'Noun: A user role displayed in a badge',
			} );
			break;
		case 'author':
			text = translate( 'Author', {
				context: 'Noun: A user role displayed in a badge',
			} );
			break;
		case 'contributor':
			text = translate( 'Contributor', {
				context: 'Noun: A user role displayed in a badge',
			} );
			break;
		case 'subscriber':
			text = translate( 'Viewer', {
				context: 'Noun: A user role displayed in a badge',
			} );
			break;
		case 'follower':
			text = translate( 'Follower' );
			break;
		case 'email-subscriber':
			text = translate( 'Email subscriber' );
			break;
		case 'viewer':
			text = translate( 'Viewer' );
			break;
		case 'shop_manager':
			text = translate( 'Shop manager' );
			break;
		case 'customer':
			text = translate( 'Customer' );
			break;
		default:
			text = role;
	}

	return text;
};

export const getRoleFilterValues: { value: string[]; label: string }[] = [
	{
		value: [ 'super-admin' ],
		label: translate( 'Super Admin' ),
	},
	{
		value: [ 'administrator' ],
		label: translate( 'Admin' ),
	},
	{
		value: [ 'editor' ],
		label: translate( 'Editor' ),
	},
	{
		value: [ 'author' ],
		label: translate( 'Author' ),
	},
	{
		value: [ 'contributor' ],
		label: translate( 'Contributor' ),
	},
	{
		value: [ 'follower' ],
		label: translate( 'Follower' ),
	},
	{
		value: [ 'email-subscriber' ],
		label: translate( 'Email subscriber' ),
	},
	{
		value: [ 'viewer', 'subscriber' ],
		label: translate( 'Viewer' ),
	},
];
