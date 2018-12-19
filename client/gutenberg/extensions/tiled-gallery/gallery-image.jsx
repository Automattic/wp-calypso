/**
 * External Dependencies
 */
import classnames from 'classnames';
import { BACKSPACE, DELETE } from '@wordpress/keycodes';
import { Component, Fragment } from '@wordpress/element';
import { IconButton, Spinner } from '@wordpress/components';
import { isBlobURL } from '@wordpress/blob'; // @TODO Add dep Jetpack-side
import { RichText } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class GalleryImage extends Component {
	state = {
		captionSelected: false,
	};

	bindContainer = ref => void ( this.container = ref );

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

	onKeyDown = event => {
		if (
			this.container === document.activeElement &&
			this.props.isSelected &&
			[ BACKSPACE, DELETE ].indexOf( event.keyCode ) !== -1
		) {
			event.stopPropagation();
			event.preventDefault();
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
		const { image, url } = this.props;
		if ( image && ! url ) {
			const { alt_text, source_url, media_details } = image;
			const { width, height } = media_details;
			this.props.setAttributes( {
				alt: alt_text,
				height: +height,
				url: source_url,
				width: +width,
			} );
		}
	}

	render() {
		const {
			'aria-label': ariaLabel,
			alt,
			caption,
			className,
			height,
			id,
			isSelected,
			link,
			linkTo,
			onRemove,
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
					src={ url }
					alt={ alt }
					data-id={ id }
					data-height={ height }
					data-width={ width }
					onClick={ this.onImageClick }
					tabIndex="0"
					onKeyDown={ this.onImageClick }
					aria-label={ ariaLabel }
				/>
				{ isBlobURL( url ) && <Spinner /> }
			</Fragment>
			/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
		);

		// Disable reason: Each block can be selected by clicking on it and we should keep the same saved markup
		/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
		return (
			<figure
				className={ classnames( className, {
					'is-selected': isSelected,
					'is-transient': isBlobURL( url ),
				} ) }
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
		/* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
	}
}

export default withSelect( ( select, ownProps ) => {
	const { getMedia } = select( 'core' );
	const { id } = ownProps;

	return {
		image: id ? getMedia( id ) : null,
	};
} )( GalleryImage );
