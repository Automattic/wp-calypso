import { getMimePrefix } from 'calypso/lib/media/utils';
import { MediaTypes } from '../constants';

/**
 * Given a REST API media object, attempts to infer the type and returns a
 * normalized deserialized media object.
 *
 * @param  {*}      node Media object to parse
 * @returns {Object}      Normalized object
 */
export function deserialize( node ) {
	const normalized = {
		media: {
			transient: false,
			...node,
		},
		appearance: {},
	};

	// Infer media type
	switch ( getMimePrefix( node ) ) {
		case 'image':
			normalized.type = MediaTypes.IMAGE;
			break;
		case 'audio':
			normalized.type = MediaTypes.AUDIO;
			break;
		case 'video':
			normalized.type = MediaTypes.VIDEO;
			break;
	}

	return normalized;
}
