/**
 * External dependencies
 */
import { upperFirst, camelCase, map, find } from 'lodash';

/**
 * WordPress dependencies
 */
import apiRequest from '@wordpress/api-request';

/**
 * Internal dependencies
 */
import { getEntitiesByKind } from './selectors';
import { addEntities } from './actions';

export const defaultEntities = [
	{ name: 'postType', kind: 'root', key: 'slug', baseUrl: '/wp/v2/types' },
	{ name: 'media', kind: 'root', baseUrl: '/wp/v2/media', plural: 'mediaItems' },
	{ name: 'taxonomy', kind: 'root', key: 'slug', baseUrl: '/wp/v2/taxonomies', plural: 'taxonomies' },
];

export const kinds = [
	{ name: 'postType', loadEntities: loadPostTypeEntities },
];

/**
 * Returns the list of post type entities.
 *
 * @return {Promise} Entities promise
 */
async function loadPostTypeEntities() {
	const postTypes = await apiRequest( { path: '/wp/v2/types?context=edit' } );
	return map( postTypes, ( postType, name ) => {
		return {
			kind: 'postType',
			baseUrl: '/wp/v2/' + postType.rest_base,
			name,
		};
	} );
}

/**
 * Returns the entity's getter method name given its kind and name.
 *
 * @param {string}  kind      Entity kind.
 * @param {string}  name      Entity name.
 * @param {string}  prefix    Function prefix.
 * @param {boolean} usePlural Whether to use the plural form or not.
 *
 * @return {string} Method name
 */
export const getMethodName = ( kind, name, prefix = 'get', usePlural = false ) => {
	const entity = find( defaultEntities, { kind, name } );
	const kindPrefix = kind === 'root' ? '' : upperFirst( camelCase( kind ) );
	const nameSuffix = upperFirst( camelCase( name ) ) + ( usePlural ? 's' : '' );
	const suffix = usePlural && entity.plural ? upperFirst( camelCase( entity.plural ) ) : nameSuffix;
	return `${ prefix }${ kindPrefix }${ suffix }`;
};

/**
 * Loads the kind entities into the store.
 *
 * @param {Object} state Global state
 * @param {string} kind  Kind
 *
 * @return {Array} Entities
 */
export async function* getKindEntities( state, kind ) {
	let entities = getEntitiesByKind( state, kind );

	if ( entities && entities.length !== 0 ) {
		return entities;
	}

	const kindConfig = find( kinds, { name: kind } );
	if ( ! kindConfig ) {
		return [];
	}

	entities = await kindConfig.loadEntities();
	yield addEntities( entities );

	return entities;
}
