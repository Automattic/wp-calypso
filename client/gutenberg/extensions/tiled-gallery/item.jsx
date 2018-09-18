/** @format */

/**
 * External Dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

class TiledGalleryImage extends Component {
	componentDidUpdate( prevProps ) {
		if ( prevProps.image && this.props.setAttributes ) {
			if ( prevProps.height !== this.props.height ) {
				this.props.setAttributes( { height: this.props.height } );
			}
		}
	}

	render() {
		const { url, alt, id, link, width, height, caption } = this.props;
		const style = {
			width: width + 'px',
			height: height + 'px',
		};

		return (
			<figure>
				<meta itemProp="width" content={ width } />
				<meta itemProp="height" content={ height } />
				<img
					alt={ alt }
					className={ classnames( 'tiled-gallery__image', {
						[ `wp-image-${ id }` ]: id,
					} ) }
					data-id={ id }
					data-link={ link }
					data-original-height={ height }
					data-original-width={ width }
					height={ height }
					src={ url }
					style={ style }
					width={ width }
				/>
				{ caption &&
					caption.length > 0 && (
						<figcaption className="tiled-gallery__caption">{ caption }</figcaption>
					) }
			</figure>
		);
	}
}

function TiledGalleryItem( props ) {
	const { alt, caption, height, id, link, linkTo, url, width } = props;

	let href;
	switch ( linkTo ) {
		case 'media':
			href = url;
			break;
		case 'attachment':
			href = link;
			break;
	}

	const img = (
		<TiledGalleryImage
			url={ url }
			alt={ alt }
			id={ id }
			link={ link }
			width={ width }
			height={ height }
			caption={ caption }
			linkTo={ linkTo }
		/>
	);

	return (
		<div
			key={ id || url }
			className="tiled-gallery__item tiled-gallery__item-small"
			itemProp="associatedMedia"
			itemScope=""
			itemType="http://schema.org/ImageObject"
		>
			{ href ? <a href={ href }>{ img }</a> : img }
		</div>
	);
}

export default withSelect( ( select, ownProps ) => {
	const { getMedia } = select( 'core' );
	const { id } = ownProps;

	return {
		image: id ? getMedia( id ) : null,
	};
} )( TiledGalleryItem );
