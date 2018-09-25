/** @format */

/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { RichText } from '@wordpress/editor';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { defaultColumnsNumber } from './edit';
import LayoutStyles from './layout-styles';

export default ( { attributes, className } ) => {
	const {
		columns = defaultColumnsNumber( attributes ),
		imageCrop,
		images,
		layout,
		linkTo,
	} = attributes;
	return (
		<Fragment>
			<LayoutStyles
				layout={ layout }
				columns={ columns }
				images={ images }
				className={ className }
			/>
			<ul
				className={ classnames( className, `columns-${ columns }`, {
					'is-cropped': imageCrop,
				} ) }
			>
				{ images.map( ( image, index ) => {
					let href;

					switch ( linkTo ) {
						case 'media':
							href = image.url;
							break;
						case 'attachment':
							href = image.link;
							break;
					}

					const img = (
						<img
							src={ image.url }
							alt={ image.alt }
							data-id={ image.id }
							data-link={ image.link }
							className={ classnames( {
								[ `wp-image-${ image.id }` ]: image.id,
							} ) }
						/>
					);

					return (
						<li
							key={ image.id || image.url }
							className={ `tiled-gallery__item tiled-gallery__item-${ index }` }
						>
							<figure>
								{ href ? <a href={ href }>{ img }</a> : img }
								{ layout !== 'circle' &&
									image.caption &&
									image.caption.length > 0 && (
										<RichText.Content tagName="figcaption" value={ image.caption } />
									) }
							</figure>
						</li>
					);
				} ) }
			</ul>
		</Fragment>
	);
};
