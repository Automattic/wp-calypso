export function Author( constructor ) {
	Object.defineProperty( this, 'constructor', {
		value: constructor || this
	} );
}

export function AnonymousUser( {
	avatar = null,
	displayName = '',
	email = null,
	url = null,
} ) {
	const user = new Author( AnonymousUser );

	user.avatar = avatar;
	user.displayName = displayName;
	user.email = email;
	user.url = url;

	return user;
}

export function WordPressUser( userId ) {
	const user = new Author( WordPressUser );

	user.userId = userId;

	return user;
}
