/**
 * External dependencies
 *
 * @format
 */
import { unescape } from 'lodash';

export const fromApi = ( { description, name, slug, term_id } ) => ( {
	description,
	id: term_id,
	name: unescape( name ),
	slug,
} );
