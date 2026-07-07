/**
 * ExcerptPicker — renders post excerpt suggestions in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response with
 * data.type set to 'excerpt-picker' (from the jetpack-ai/generate-excerpt
 * ability). Clicking a card applies it to the post excerpt via editPost.
 * Thin wrapper over the shared BaseSuggestionPicker.
 */

/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import BaseSuggestionPicker from './base-suggestion-picker';

/**
 * Props for the ExcerptPicker component.
 */
interface ExcerptOption {
	excerpt: string;
	explanation?: string;
}

interface ExcerptPickerProps {
	excerpts: ExcerptOption[];
	onComplete?: () => void;
}

/**
 * ExcerptPicker component for the chat sidebar.
 * @param {ExcerptPickerProps} props - Component props.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function ExcerptPicker( { excerpts, onComplete }: ExcerptPickerProps ) {
	const { editPost } = useDispatch( 'core/editor' );
	const currentExcerpt = useSelect( ( select ) => {
		return (
			select( 'core/editor' ) as {
				getEditedPostAttribute?: ( attr: string ) => unknown;
			}
		 )?.getEditedPostAttribute?.( 'excerpt' );
	}, [] );

	const handleApply = useCallback(
		( excerpt: string ) => {
			editPost( { excerpt } );
			onComplete?.();
		},
		[ editPost, onComplete ]
	);

	// The props arrive from an orchestrator tool payload, so guard the shape
	// instead of trusting the TypeScript type.
	const options = Array.isArray( excerpts )
		? excerpts
				.map( ( option ) => option?.excerpt )
				.filter( ( excerpt ): excerpt is string => typeof excerpt === 'string' )
		: [];

	return (
		<BaseSuggestionPicker
			intro={ __(
				'Choose an excerpt for your post — ask for a different length or tone if you’d like:',
				'jetpack'
			) }
			options={ options }
			onApply={ handleApply }
			appliedMessage={ __( 'Excerpt updated.', 'jetpack' ) }
			currentValue={ typeof currentExcerpt === 'string' ? currentExcerpt : undefined }
		/>
	);
}
