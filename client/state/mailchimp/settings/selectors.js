import 'calypso/state/mailchimp/init';

export function getListId( state, siteId ) {
	return state?.mailchimp?.settings?.items?.[ siteId ]?.follower_list_id ?? 0;
}
