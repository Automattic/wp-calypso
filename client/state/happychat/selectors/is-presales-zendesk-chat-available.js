import 'calypso/state/happychat/init';

/**
 * Returns if presales zendesk chat is available.
 *
 * @param   {Object}  state  Global state tree
 * @returns {boolean}        true, when presales_zendesk is available
 */
export default function isPresalesZendeskChatAvailable( state ) {
	return state.happychat?.user?.availability?.presale_zendesk ?? false;
}
