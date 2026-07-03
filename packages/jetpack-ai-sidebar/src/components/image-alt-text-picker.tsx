/**
 * ImageAltTextPicker — reviews and applies AI-generated alt text to the post's images.
 *
 * Displayed when the orchestrator renders a show-component response with
 * data.type set to 'image-alt-text-picker' (from the jetpack-ai/generate-seo-image-alt-text
 * ability). Shows each image alongside its suggested alt text for a quick visual
 * check, then applies all of them in one click — writing the alt attribute back
 * to each image block (matched by clientId) via core/block-editor. There is a
 * single common Apply action (not per image). Applying is reversible via the
 * chat's Undo checkpoint.
 */

/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useState, useCallback } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * One generated alt-text suggestion: the target block, its image URL (for the
 * preview thumbnail), the existing alt, and the suggested alt to apply.
 */
interface AltTextSuggestion {
	clientId: string;
	alt: string;
	url?: string;
	currentAlt?: string;
}

interface ImageAltTextPickerProps {
	images: AltTextSuggestion[];
	onComplete?: () => void;
}

/**
 * ImageAltTextPicker component for the chat sidebar.
 *
 * Renders each image next to its suggested alt text, then applies every
 * suggestion in one action via a single common Apply button and shows a
 * confirmation.
 * @param {ImageAltTextPickerProps} props - Component props.
 * @returns {import('react').ReactElement|null} The rendered component.
 */
export default function ImageAltTextPicker( { images, onComplete }: ImageAltTextPickerProps ) {
	const [ applied, setApplied ] = useState( false );
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const handleApplyAll = useCallback( () => {
		images.forEach( ( image ) => {
			updateBlockAttributes( image.clientId, { alt: image.alt } );
		} );
		setApplied( true );
		onComplete?.();
	}, [ images, updateBlockAttributes, onComplete ] );

	if ( ! images?.length ) {
		return null;
	}

	const count = images.length;

	return (
		<div className="jetpack-ai-image-alt-text-picker">
			<p className="jetpack-ai-image-alt-text-picker__intro">
				{ __( 'Suggested alt text for your images:', 'jetpack' ) }
			</p>
			<ul className="jetpack-ai-image-alt-text-picker__list">
				{ images.map( ( image ) => (
					<li key={ image.clientId } className="jetpack-ai-image-alt-text-picker__row">
						{ image.url && (
							<img
								className="jetpack-ai-image-alt-text-picker__thumb"
								src={ image.url }
								alt={ image.currentAlt || '' }
								loading="lazy"
							/>
						) }
						<span className="jetpack-ai-image-alt-text-picker__alt">{ image.alt }</span>
					</li>
				) ) }
			</ul>
			{ applied ? (
				<p className="jetpack-ai-image-alt-text-picker__status">
					{ sprintf(
						/* translators: %d: number of images whose HTML alt text attribute was updated. */
						_n(
							'Updated the HTML alt text attribute for %d image.',
							'Updated the HTML alt text attribute for %d images.',
							count,
							'jetpack'
						),
						count
					) }
				</p>
			) : (
				<button
					type="button"
					className="jetpack-ai-image-alt-text-picker__apply-all"
					onClick={ handleApplyAll }
				>
					{ sprintf(
						/* translators: %d: number of images to apply alt text to. */
						_n( 'Apply to %d image', 'Apply to all %d images', count, 'jetpack' ),
						count
					) }
				</button>
			) }
		</div>
	);
}
