/**
 * SeoTitlePicker — renders SEO meta-title suggestions in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response with
 * data.type set to 'seo-title-picker' (from the jetpack-ai/generate-seo-title ability).
 * Clicking a card applies it to the post's SEO title (the HTML <title>
 * override, Jetpack post meta `jetpack_seo_html_title`) — distinct from the
 * editorial post title set by the title-picker. Thin wrapper over the shared
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
 * Jetpack SEO post meta key for the custom HTML <title> override.
 * @see Jetpack_SEO_Posts::HTML_TITLE_META_KEY
 */
const SEO_TITLE_META_KEY = 'jetpack_seo_html_title';

/**
 * Props for the SeoTitlePicker component.
 */
interface SeoTitleOption {
	title: string;
	explanation?: string;
}

interface SeoTitlePickerProps {
	titles: SeoTitleOption[];
	onComplete?: () => void;
}

/**
 * SeoTitlePicker component for the chat sidebar.
 * @param {SeoTitlePickerProps} props - Component props.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function SeoTitlePicker( { titles, onComplete }: SeoTitlePickerProps ) {
	const { editPost } = useDispatch( 'core/editor' );

	const handleApply = useCallback(
		( title: string ) => {
			editPost( { meta: { [ SEO_TITLE_META_KEY ]: title } } );
			onComplete?.();
		},
		[ editPost, onComplete ]
	);

	return (
		<BaseSuggestionPicker
			intro={ __( 'Choose an SEO title for your post:', 'jetpack' ) }
			options={ titles.map( ( option ) => option.title ) }
			onApply={ handleApply }
			appliedMessage={ __( 'SEO title updated.', 'jetpack' ) }
		/>
	);
}
