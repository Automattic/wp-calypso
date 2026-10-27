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
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { revealSidebarField } from '../utils/reveal-sidebar-field';
import BaseSuggestionPicker from './base-suggestion-picker';
import type { OnResponseAction } from '../utils/response-action';

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
	titles?: SeoTitleOption[];
	onComplete?: () => void;
	onResponseAction?: OnResponseAction;
}

/** Renders SEO title suggestions and applies the selected title to post meta. */
export default function SeoTitlePicker( {
	titles,
	onComplete,
	onResponseAction,
}: SeoTitlePickerProps ) {
	const { editPost } = useDispatch( 'core/editor' );
	const currentSeoTitle = useSelect( ( select ) => {
		const meta = (
			select( 'core/editor' ) as {
				getEditedPostAttribute?: ( attr: string ) => Record< string, unknown > | undefined;
			}
		 )?.getEditedPostAttribute?.( 'meta' );
		return meta?.[ SEO_TITLE_META_KEY ];
	}, [] );

	const handleApply = useCallback(
		( title: string ) => {
			editPost( { meta: { [ SEO_TITLE_META_KEY ]: title } } );
			revealSidebarField( 'seo' );
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
			intro={ __( 'Choose an SEO title for your post:', 'jetpack' ) }
			options={ options }
			onApply={ handleApply }
			onComplete={ onComplete }
			appliedMessage={ __( 'SEO title updated.', 'jetpack' ) }
			currentValue={ typeof currentSeoTitle === 'string' ? currentSeoTitle : undefined }
			onResponseAction={ onResponseAction }
		/>
	);
}
