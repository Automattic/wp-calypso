/**
 * Internal dependencies
 */
import Layout from './layout';
import { defaultColumnsNumber } from './edit';
import { getActiveStyleName } from 'gutenberg/extensions/utils';
import { LAYOUT_STYLES } from './constants';

export default function TiledGallerySave( { attributes } ) {
	const { images } = attributes;

	if ( ! images.length ) {
		return null;
	}

	const { className, columns = defaultColumnsNumber( attributes ), imageCrop, linkTo } = attributes;

	return (
		<Layout
			className={ className }
			columns={ columns }
			imageCrop={ imageCrop }
			images={ images }
			layoutStyle={ getActiveStyleName( LAYOUT_STYLES, className ) }
			linkTo={ linkTo }
			onRemoveImage={ callOnMe }
			onSelectImage={ callOnMe }
			setImageAttributes={ callOnMe }
		/>
	);
}

// Just a thing we can call and call and call…
// Useful to make maybe curried handlers that we don't care about
function callOnMe() {
	return callOnMe;
}
