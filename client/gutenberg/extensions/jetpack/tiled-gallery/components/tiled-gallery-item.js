/*global wp*/
/* eslint wpcalypso/jsx-classname-namespace: 0 */

/**
 * WordPress dependencies (npm)
 */
const { withSelect } = wp.data;
const { Component } = wp.element;

/**
 * External Dependencies
 */
import React from 'react';
import get from 'lodash/get';

class TiledGalleryImage extends Component {

	UNSAFE_componentWillReceiveProps( { image, width, height } ) {
		// very carefully set width & height attributes once only (to avoid recurse)!
		if ( image && ! width && ! height && this.props.setAttributes ) {
			const mediaInfo = get( image, [ 'media_details' ], { width: null, height: null } );
			this.props.setAttributes( {
				width: mediaInfo.width,
				height: mediaInfo.height
			} );
		}
	}

	render() {
		const { url, alt, id, link, width, height, caption } = this.props;
		const styleAttr = {
			width: width + 'px',
			height: height + 'px',
		};

		return (
			<figure>
				<meta itemprop="width" content={ width } />
				<meta itemprop="height" content={ height } />
				<img
					src={ url } alt={ alt } data-id={ id } data-link={ link }
					width={ width }
					height={ height }
					style={ styleAttr }
					data-original-width={ width }
					data-original-height={ height } />
				{ caption && caption.length > 0 && <figcaption className="tiled-gallery-caption">{ caption }</figcaption> }
			</figure>
		);
	}
}

function TiledGalleryItem( props ) {
	const classes = [ 'tiled-gallery-item' ];
	classes.push( 'tiled-gallery-item-small' );

	let href;
	switch ( props.linkTo ) {
		case 'media':
			href = props.url;
			break;
		case 'attachment':
			href = props.link;
			break;
	}

	const img = (
		<TiledGalleryImage
			url={ props.url }
			alt={ props.alt }
			id={ props.id }
			link={ props.link }
			width={ props.width }
			height={ props.height }
			caption={ props.caption }
			linkTo={ props.linkTo }
		/>
	);

	return (
		<div
			key={ props.id || props.url }
			className={ classes.join( ' ' ) }
			itemprop="associatedMedia"
			itemscope=""
			itemtype="http://schema.org/ImageObject">
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
