/**
 * External dependencies
 */
import { RawHTML, render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Layout from './layout';
import { DEFAULT_GALLERY_WIDTH, LAYOUT_STYLES } from './constants';
import { defaultColumnsNumber } from './edit';
import { getActiveStyleName } from 'gutenberg/extensions/utils';
import { getGalleryRows, handleRowResize } from './layout/mosaic/resize';

export default function TiledGallerySave( { attributes } ) {
	const { images } = attributes;

	if ( ! images.length ) {
		return null;
	}

	const { align, className, columns = defaultColumnsNumber( attributes ), linkTo } = attributes;

	const layoutStyle = getActiveStyleName( LAYOUT_STYLES, attributes.className );

	const layout = (
		<Layout
			align={ align }
			className={ className }
			columns={ columns }
			images={ images }
			isSave
			layoutStyle={ layoutStyle }
			linkTo={ linkTo }
		/>
	);

	if ( 'rectangular' === layoutStyle ) {
		const d = document.createElement( 'div' );
		render( layout, d );
		getGalleryRows( d ).forEach( r => handleRowResize( r, DEFAULT_GALLERY_WIDTH ) );
		return <RawHTML>{ d.innerHTML }</RawHTML>;
	}

	// Wrap in extra div to match RawHTML output :(
	return <div>{ layout }</div>;
}
