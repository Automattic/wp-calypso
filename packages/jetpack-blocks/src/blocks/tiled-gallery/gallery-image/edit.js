/**
 * External Dependencies
 */
import classnames from 'classnames';
import { BACKSPACE, DELETE } from '@wordpress/keycodes';
import { Component, createRef, Fragment } from '@wordpress/element';
import { IconButton, Spinner } from '@wordpress/components';
import { isBlobURL } from '@wordpress/blob';
/* @TODO Caption has been commented out */
// import { RichText } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from '../../../utils/i18n';

class GalleryImageEdit extends Component {
	img = createRef();

	/* @TODO Caption has been commented out */
	// state = {
	// 	captionSelected: false,
	// };

	// onSelectCaption = () => {
	// 	if ( ! this.state.captionSelected ) {
	// 		this.setState( {
	// 			captionSelected: true,
	// 		} );
	// 	}

	// 	if ( ! this.props.isSelected ) {
	// 		this.props.onSelect();
	// 	}
	// };

	onImageClick = () => {
		if ( ! this.props.isSelected ) {
			this.props.onSelect();
		}

		// if ( this.state.captionSelected ) {
		// 	this.setState( {
		// 		captionSelected: false,
		// 	} );
		// }
	};

	onImageKeyDown = event => {
		if (
			this.img.current === document.activeElement &&
			this.props.isSelected &&
			[ BACKSPACE, DELETE ].includes( event.keyCode )
		) {
			this.props.onRemove();
		}
	};

	/* @TODO Caption has been commented out */
	// static getDerivedStateFromProps( props, state ) {
	// 	// unselect the caption so when the user selects other image and comeback
	// 	// the caption is not immediately selected
	// 	if ( ! props.isSelected && state.captionSelected ) {
	// 		return { captionSelected: false };
	// 	}
	// 	return null;
	// }

	componentDidUpdate() {
		const { alt, height, image, link, url, width } = this.props;

		if ( image ) {
			const nextAtts = {};

			if ( ! alt && image.alt_text ) {
				nextAtts.alt = image.alt_text;
			}
			if ( ! height && image.media_details && image.media_details.height ) {
				nextAtts.height = +image.media_details.height;
			}
			if ( ! link && image.link ) {
				nextAtts.link = image.link;
			}
			if ( ! url && image.source_url ) {
				nextAtts.url = image.source_url;
			}
			if ( ! width && image.media_details && image.media_details.width ) {
				nextAtts.width = +image.media_details.width;
			}

			if ( Object.keys( nextAtts ).length ) {
				this.props.setAttributes( nextAtts );
			}
		}
	}

	render() {
		const {
			'aria-label': ariaLabel,
			alt,
			// caption,
			height,
			id,
			imageFilter,
			isSelected,
			link,
			linkTo,
			onRemove,
			origUrl,
			// setAttributes,
			url,
			width,
		} = this.props;

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
			// Disable reason: Image itself is not meant to be interactive, but should
			// direct image selection and unfocus caption fields.
			/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
			<Fragment>
				<img
					alt={ alt }
					aria-label={ ariaLabel }
					data-height={ height }
					data-id={ id }
					data-link={ link }
					data-url={ origUrl }
					data-width={ width }
					onClick={ this.onImageClick }
					onKeyDown={ this.onImageKeyDown }
					ref={ this.img }
					src={ url }
					tabIndex="0"
				/>
				{ isBlobURL( origUrl ) && <Spinner /> }
			</Fragment>
			/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
		);

		// Disable reason: Each block can be selected by clicking on it and we should keep the same saved markup
		return (
			<figure
				className={ classnames( 'tiled-gallery__item', {
					'is-selected': isSelected,
					'is-transient': isBlobURL( origUrl ),
					[ `filter__${ imageFilter }` ]: !! imageFilter,
				} ) }
			>
				{ isSelected && (
					<div className="tiled-gallery__item__inline-menu">
						<IconButton
							icon="no-alt"
							onClick={ onRemove }
							className="tiled-gallery__item__remove"
							label={ __( 'Remove Image' ) }
						/>
					</div>
				) }
				{ /* Keep the <a> HTML structure, but ensure there is no navigation from edit */
				/* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
				{ href ? <a>{ img }</a> : img }
				{ /* ( ! RichText.isEmpty( caption ) || isSelected ) && (
					<RichText
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						isSelected={ this.state.captionSelected }
						onChange={ newCaption => setAttributes( { caption: newCaption } ) }
						unstableOnFocus={ this.onSelectCaption }
						inlineToolbar
					/>
				) */ }
			</figure>
		);
	}
}

export default withSelect( ( select, ownProps ) => {
	const { getMedia } = select( 'core' );
	const { id } = ownProps;

	return {
		image: id ? getMedia( id ) : null,
	};
} )( GalleryImageEdit );
