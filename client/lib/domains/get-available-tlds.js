import wpcom from 'calypso/lib/wp';

export function getAvailableTlds( query = {} ) {
	return wpcom.req.get( '/domains/suggestions/tlds', query );
}
