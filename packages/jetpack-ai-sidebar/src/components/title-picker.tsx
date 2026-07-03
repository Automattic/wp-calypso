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
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import BaseSuggestionPicker from './base-suggestion-picker';

/**
 * Props for the TitlePicker component.
 */
interface TitleOption {
	title: string;
	explanation?: string;
}

interface TitlePickerProps {
	titles: TitleOption[];
	onComplete?: () => void;
}

/**
 * TitlePicker component for the chat sidebar.
 * @param {TitlePickerProps} props - Component props.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function TitlePicker( { titles, onComplete }: TitlePickerProps ) {
	const { editPost } = useDispatch( 'core/editor' );

	const handleApply = useCallback(
		( title: string ) => {
			editPost( { title } );
			onComplete?.();
		},
		[ editPost, onComplete ]
	);

	return (
		<BaseSuggestionPicker
			intro={ __( 'Choose a title for your post:', 'jetpack' ) }
			options={ titles.map( ( option ) => option.title ) }
			onApply={ handleApply }
			appliedMessage={ __( 'Title updated.', 'jetpack' ) }
		/>
	);
}
