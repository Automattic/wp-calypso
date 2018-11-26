/** @format */

/**
 * This component is originally from Gutenberg Gallery block:
 * @link https://github.com/WordPress/gutenberg/blob/1cd604df7e9017e0dbe3ab64897ac3af35ca35c5/packages/block-library/src/gallery/gallery-image.js
 */

/**
 * External Dependencies
 */
import { BACKSPACE, DELETE } from '@wordpress/keycodes';
import { Component } from '@wordpress/element';
import { IconButton, Spinner } from '@wordpress/components';
import { RichText } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class GalleryImage extends Component {
	constructor() {
		super( ...arguments );

		this.onImageClick = this.onImageClick.bind( this );
		this.onSelectCaption = this.onSelectCaption.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.bindContainer = this.bindContainer.bind( this );

		this.state = {
			captionSelected: false,
		};
	}

	bindContainer( ref ) {
		this.container = ref;
	}

	onSelectCaption() {
		if ( ! this.state.captionSelected ) {
			this.setState( {
				captionSelected: true,
			} );
		}

		if ( ! this.props.isSelected ) {
			this.props.onSelect();
		}
	}

	onImageClick() {
		if ( ! this.props.isSelected ) {
			this.props.onSelect();
		}

		if ( this.state.captionSelected ) {
			this.setState( {
				captionSelected: false,
			} );
		}
	}

	onKeyDown( event ) {
		if (
			this.container === document.activeElement &&
			this.props.isSelected &&
			[ BACKSPACE, DELETE ].indexOf( event.keyCode ) !== -1
		) {
			event.stopPropagation();
			event.preventDefault();
			this.props.onRemove();
		}
	}

	componentDidUpdate( prevProps ) {
		const { isSelected, image, url } = this.props;
		if ( image && ! url ) {
			this.props.setAttributes( {
				url: image.source_url,
				alt: image.alt_text,
			} );
		}

		// unselect the caption so when the user selects other image and comeback
		// the caption is not immediately selected
		if ( this.state.captionSelected && ! isSelected && prevProps.isSelected ) {
			//eslint-disable-next-line
			this.setState( {
				captionSelected: false,
			} );
		}
	}

	render() {
		const { url, alt, id, linkTo, link, isSelected, caption, onRemove, setAttributes } = this.props;

		let href;

		switch ( linkTo ) {
			case 'media':
				href = url;
				break;
			case 'attachment':
				href = link;
				break;
		}

		const img = url ? (
			// Disable reason: Image itself is not meant to be
			// interactive, but should direct image selection and unfocus caption fields
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
			<img src={ url } alt={ alt } data-id={ id } onClick={ this.onImageClick } />
		) : (
			<Spinner />
		);

		const className = classnames( {
			'is-selected': isSelected,
			'is-transient': url && 0 === url.indexOf( 'blob:' ),
		} );

		// Disable reason: Each block can be selected by clicking on it and we should keep the same saved markup
		/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		return (
			<figure
				className={ className }
				tabIndex="-1"
				onKeyDown={ this.onKeyDown }
				ref={ this.bindContainer }
			>
				{ isSelected && (
					<div className="block-library-gallery-item__inline-menu">
						<IconButton
							icon="no-alt"
							onClick={ onRemove }
							className="blocks-gallery-item__remove"
							label={ __( 'Remove Image' ) }
						/>
					</div>
				) }
				{ href ? <a href={ href }>{ img }</a> : img }
				{ ! RichText.isEmpty( caption ) || isSelected ? (
					<RichText
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						isSelected={ this.state.captionSelected }
						onChange={ newCaption => setAttributes( { caption: newCaption } ) }
						unstableOnFocus={ this.onSelectCaption }
						inlineToolbar
					/>
				) : null }
			</figure>
		);
		/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	}
}

export default withSelect( ( select, ownProps ) => {
	const { getMedia } = select( 'core' );
	const { id } = ownProps;

	return {
		image: id ? getMedia( id ) : null,
	};
} )( GalleryImage );
