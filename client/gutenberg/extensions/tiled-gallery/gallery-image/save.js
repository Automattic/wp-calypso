/**
 * External Dependencies
 */
import { isBlobURL } from '@wordpress/blob'; // @TODO Add dep Jetpack-side
import { RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export default function GalleryImageSave( props ) {
	const {
		'aria-label': ariaLabel,
		alt,
		caption,
		className,
		height,
		id,
		link,
		linkTo,
		url,
		width,
	} = props;

	if ( isBlobURL( url ) ) {
		return null;
	}

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
		<img
			src={ url }
			alt={ alt }
			data-id={ id }
			data-height={ height }
			data-width={ width }
			aria-label={ ariaLabel }
		/>
	);

	return (
		<figure className={ className }>
			{ href ? <a href={ href }>{ img }</a> : img }
			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content
					tagName="figcaption"
					placeholder={ __( 'Write caption…' ) }
					value={ caption }
				/>
			) }
		</figure>
	);
}
