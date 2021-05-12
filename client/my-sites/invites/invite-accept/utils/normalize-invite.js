/**
 * External dependencies
 */

import { mapValues } from 'lodash';

/**
 * Internal Dependencies
 */
import { decodeEntities } from 'calypso/lib/formatting';

function filterObjectProperties( object ) {
	return mapValues( object, ( value ) => {
		if ( 'object' === typeof value ) {
			return filterObjectProperties( value );
		}

		return value ? decodeEntities( value ) : value;
	} );
}

export default function normalizeInvite( data ) {
	return {
		inviteKey: data.invite.invite_slug,
		date: data.invite.invite_date,
		role: decodeEntities( data.invite.meta.role ),
		sentTo: decodeEntities( data.invite.meta.sent_to ),
		forceMatchingEmail: data.invite.meta.force_matching_email,
		site: Object.assign( filterObjectProperties( data.blog_details ), {
			ID: parseInt( data.invite.blog_id, 10 ),
		} ),
		inviter: filterObjectProperties( data.inviter ),
		knownUser: data.invite.meta.known,
	};
}
