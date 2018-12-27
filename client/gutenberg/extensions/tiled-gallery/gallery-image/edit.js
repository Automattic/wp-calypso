/**
 * External Dependencies
 */
import classnames from 'classnames';
import { BACKSPACE, DELETE } from '@wordpress/keycodes';
import { Component, createRef, Fragment } from '@wordpress/element';
import { IconButton, Spinner } from '@wordpress/components';
import { isBlobURL } from '@wordpress/blob'; // @TODO Add dep Jetpack-side
import { RichText } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class GalleryImageEdit extends Component {
	img = createRef();

	state = {
		captionSelected: false,
	};

	onSelectCaption = () => {
		if ( ! this.state.captionSelected ) {
			this.setState( {
				captionSelected: true,
			} );
		}

		if ( ! this.props.isSelected ) {
			this.props.onSelect();
		}
	};

	onImageClick = e => {
		// Don't let click event trigger naviagtion on <a>. @TODO How does g7g handle this?
		e.preventDefault();
		e.stopPropagation();

		if ( ! this.props.isSelected ) {
			this.props.onSelect();
		}

		if ( this.state.captionSelected ) {
			this.setState( {
				captionSelected: false,
			} );
		}
	};

	onImageKeyDown = event => {
		event.stopPropagation();
		if (
			this.img.current === document.activeElement &&
			this.props.isSelected &&
			[ BACKSPACE, DELETE ].includes( event.keyCode )
		) {
			this.props.onRemove();
		}
	};

	static getDerivedStateFromProps( props, state ) {
		// unselect the caption so when the user selects other image and comeback
		// the caption is not immediately selected
		if ( ! props.isSelected && state.captionSelected ) {
			return { captionSelected: false };
		}
		return null;
	}

	componentDidUpdate() {
		const { alt, height, image, url, width } = this.props;

		if ( image ) {
			const nextAtts = {};

			if ( ! url && image.source_url ) {
				nextAtts.url = image.source_url;
			}
			if ( ! alt && image.alt_text ) {
				nextAtts.alt = image.alt_text;
			}
			if ( ! width && image.media_details && image.media_details.width ) {
				nextAtts.width = +image.media_details.width;
			}
			if ( ! height && image.media_details && image.media_details.height ) {
				nextAtts.height = +image.media_details.height;
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
			caption,
			height,
			id,
			isSelected,
			link,
			linkTo,
			onRemove,
			origUrl,
			setAttributes,
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
	}
}

export default withSelect( ( select, ownProps ) => {
	const { getMedia } = select( 'core' );
	const { id } = ownProps;

	return {
		image: id ? getMedia( id ) : null,
	};
} )( GalleryImageEdit );
