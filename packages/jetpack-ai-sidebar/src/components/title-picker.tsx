/**
 * TitlePicker — renders editorial post-title suggestions in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response with
 * data.type set to 'title-picker'. Clicking a card applies it to the post title
 * immediately via core/editor. Thin wrapper over the shared BaseSuggestionPicker.
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
import { notifySuggestionActionComplete } from '../utils/suggestion-events';
import BaseSuggestionPicker from './base-suggestion-picker';
import type { OnResponseAction } from '../utils/response-action';

/**
 * Props for the TitlePicker component.
 */
interface TitleOption {
	title: string;
	explanation?: string;
}

interface TitlePickerProps {
	titles?: TitleOption[];
	onComplete?: () => void;
	onResponseAction?: OnResponseAction;
}

/** Renders title suggestions and applies the selected title to the post. */
export default function TitlePicker( { titles, onComplete, onResponseAction }: TitlePickerProps ) {
	const { editPost } = useDispatch( 'core/editor' );
	const currentTitle = useSelect(
		( select ) =>
			(
				select( 'core/editor' ) as {
					getEditedPostAttribute?: ( attr: string ) => unknown;
				}
			 )?.getEditedPostAttribute?.( 'title' ),
		[]
	);

	const handleApply = useCallback(
		( title: string ) => {
			editPost( { title } );
			notifySuggestionActionComplete();
		},
		[ editPost ]
	);

	// The props arrive from an orchestrator tool payload, so guard the shape
	// instead of trusting the TypeScript type.
	const options = Array.isArray( titles )
		? titles
				.map( ( option ) => option?.title )
				.filter( ( title ): title is string => typeof title === 'string' && title.trim() !== '' )
		: [];

	return (
		<BaseSuggestionPicker
			intro={ __( 'Choose a title for your post:', __i18n_text_domain__ ) }
			options={ options }
			onApply={ handleApply }
			onComplete={ onComplete }
			appliedMessage={ __( 'Title updated.', __i18n_text_domain__ ) }
			currentValue={ typeof currentTitle === 'string' ? currentTitle : undefined }
			onResponseAction={ onResponseAction }
		/>
	);
}
