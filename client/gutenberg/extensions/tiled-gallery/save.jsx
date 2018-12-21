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

	const { className, columns = defaultColumnsNumber( attributes ), linkTo } = attributes;

	return (
		<Layout
			className={ className }
			columns={ columns }
			images={ images }
			isSave
			layoutStyle={ getActiveStyleName( LAYOUT_STYLES, className ) }
			linkTo={ linkTo }
		/>
	);
}
