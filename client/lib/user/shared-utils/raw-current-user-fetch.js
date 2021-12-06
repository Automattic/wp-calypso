import wpcom from 'calypso/lib/wp';

export function rawCurrentUserFetch() {
	return wpcom.req.get( '/me', { meta: 'flags' } );
}
