/**
 * External dependencies
 */
import { unescape } from 'lodash';

export const fromApi = ( { description, name, slug, term_id } ) => ( {
	description: unescape( description ),
	id: term_id,
	name: unescape( name ),
	slug,
} );
