/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Layout from './layout';
import { defaultColumnsNumber } from './edit';
import {
	getActiveStyleName,
	getDefaultStyleClass,
	hasStyleClass,
} from 'gutenberg/extensions/utils';
import { LAYOUT_STYLES } from './constants';

export default function TiledGallerySave( { attributes } ) {
	const { images } = attributes;

	if ( ! images.length ) {
		return null;
	}

	const { className, columns = defaultColumnsNumber( attributes ), linkTo } = attributes;

	return (
		<Layout
			className={ classnames( className, {
				// If block is missing a style class when saving, set it to default.
				// While this happens also at componentDidMount, we need it here
				// to make sure the block doesn't get invalidated
				[ getDefaultStyleClass( LAYOUT_STYLES ) ]: ! hasStyleClass( className ),
			} ) }
			columns={ columns }
			images={ images }
			isSave
			layoutStyle={ getActiveStyleName( LAYOUT_STYLES, className ) }
			linkTo={ linkTo }
		/>
	);
}
