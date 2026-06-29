/**
 * ImageAltTextPicker — applies AI-generated alt text to the post's images.
 *
 * Displayed when the orchestrator renders a show-component response with
 * data.type set to 'image-alt-text-picker' (from the jetpack-ai/image-alt-text
 * ability). The generated alt text is not surfaced for per-image review (parity
 * with the existing SEO Enhancer, which applies alt text directly). Instead the
 * user applies it to every image in one click, writing the alt attribute back to
 * each image block (matched by clientId) via core/block-editor. Applying is
 * reversible via the chat's Undo checkpoint.
 */

/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useState, useCallback } from '@wordpress/element';
import { _n, sprintf } from '@wordpress/i18n';

/**
 * One generated alt-text suggestion. `url`/`currentAlt` are carried in the
 * payload but unused here — the picker applies by clientId without showing the
 * image.
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
 * Applies the generated alt text to every image in one action and shows a
 * confirmation. No per-image review UI is rendered.
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

	if ( applied ) {
		return (
			<div className="jetpack-ai-image-alt-text-picker">
				<p className="jetpack-ai-image-alt-text-picker__status">
					{ sprintf(
						/* translators: %d: number of images updated. */
						_n(
							'Updated alt text for %d image.',
							'Updated alt text for %d images.',
							count,
							'jetpack'
						),
						count
					) }
				</p>
			</div>
		);
	}

	return (
		<div className="jetpack-ai-image-alt-text-picker">
			<p className="jetpack-ai-image-alt-text-picker__intro">
				{ sprintf(
					/* translators: %d: number of images with generated alt text. */
					_n(
						'Generated alt text for %d image.',
						'Generated alt text for %d images.',
						count,
						'jetpack'
					),
					count
				) }
			</p>
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
		</div>
	);
}
