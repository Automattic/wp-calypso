import 'calypso/state/mailchimp/init';

export function getAllLists( state, siteId ) {
	return state?.mailchimp?.lists?.items?.[ siteId ] ?? null;
}
