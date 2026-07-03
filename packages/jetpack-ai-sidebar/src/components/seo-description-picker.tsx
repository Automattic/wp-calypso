/**
 * SeoDescriptionPicker — renders SEO meta-description suggestions in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response with
 * data.type set to 'seo-description-picker' (from the jetpack-ai/generate-seo-description
 * ability). Clicking a card applies it to the post's SEO meta description
 * (Jetpack post meta `advanced_seo_description`). Thin wrapper over the shared
 * BaseSuggestionPicker.
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
 * Jetpack SEO post meta key for the custom HTML <meta> description.
 * @see Jetpack_SEO_Posts::DESCRIPTION_META_KEY
 */
const SEO_DESCRIPTION_META_KEY = 'advanced_seo_description';

/**
 * Props for the SeoDescriptionPicker component.
 */
interface SeoDescriptionOption {
	description: string;
	explanation?: string;
}

interface SeoDescriptionPickerProps {
	descriptions: SeoDescriptionOption[];
	onComplete?: () => void;
}

/**
 * SeoDescriptionPicker component for the chat sidebar.
 * @param {SeoDescriptionPickerProps} props - Component props.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function SeoDescriptionPicker( {
	descriptions,
	onComplete,
}: SeoDescriptionPickerProps ) {
	const { editPost } = useDispatch( 'core/editor' );

	const handleApply = useCallback(
		( description: string ) => {
			editPost( { meta: { [ SEO_DESCRIPTION_META_KEY ]: description } } );
			onComplete?.();
		},
		[ editPost, onComplete ]
	);

	return (
		<BaseSuggestionPicker
			intro={ __( 'Choose an SEO description for your post:', 'jetpack' ) }
			options={ descriptions.map( ( option ) => option.description ) }
			onApply={ handleApply }
			appliedMessage={ __( 'SEO description updated.', 'jetpack' ) }
		/>
	);
}
