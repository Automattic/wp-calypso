/**
 * External dependencies
 */
import { includes, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	GalleryColumnedTypes,
	GalleryDefaultAttrs,
	GallerySizeableTypes,
} from 'calypso/lib/media/constants';
import { stringify } from 'calypso/lib/shortcode';

/**
 * Given an array of media items, returns a gallery shortcode using an
 * optional set of parameters.
 *
 * @param  {object} settings Gallery settings
 * @returns {string}          Gallery shortcode
 */
export function generateGalleryShortcode( settings ) {
	let attrs;

	if ( ! settings.items.length ) {
		return;
	}

	// gallery images are passed in as an array of objects
	// in settings.items but we just need the IDs set to attrs.ids
	attrs = Object.assign(
		{
			ids: settings.items.map( ( item ) => item.ID ).join(),
		},
		settings
	);

	delete attrs.items;

	if ( ! includes( GalleryColumnedTypes, attrs.type ) ) {
		delete attrs.columns;
	}

	if ( ! includes( GallerySizeableTypes, attrs.type ) ) {
		delete attrs.size;
	}

	attrs = omitBy( attrs, function ( value, key ) {
		return GalleryDefaultAttrs[ key ] === value;
	} );

	// WordPress expects all lowercase
	if ( attrs.orderBy ) {
		attrs.orderby = attrs.orderBy;
		delete attrs.orderBy;
	}

	return stringify( {
		tag: 'gallery',
		type: 'single',
		attrs: attrs,
	} );
}
