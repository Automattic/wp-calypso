import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isDraftAssistPostType } from '../utils/draft-assist';
import { isDraftAssistEnabled } from '../utils/preview-features';
import { trackDraftAssistEntryPointShown } from '../utils/tracking';
import type { ComponentType } from 'react';

/**
 * The prompt shown in an empty post body.
 * @returns The placeholder text.
 */
export function getDraftPlaceholder(): string {
	return __( 'Type /draft to get started with AI', __i18n_text_domain__ );
}

type ParagraphEditProps = {
	name: string;
	clientId: string;
	attributes?: Record< string, unknown >;
	[ key: string ]: unknown;
};

/**
 * Put the draft assist prompt on the editor's empty-post paragraph.
 *
 * Gutenberg 23.8.0 stopped rendering `DefaultBlockAppender` for an empty post.
 * `Items` in `BlockList` now builds a "ghost" `core/paragraph` — made with
 * `createBlock()` and deliberately never inserted into the store — and renders
 * that *instead of* the appender. `bodyPlaceholder` has exactly one consumer in
 * all of Gutenberg, and it is that appender, so the setting became inert on
 * precisely the screen draft assist targets. It worked until v23.6.2 and broke
 * with v23.8.0; nothing on our side changed.
 *
 * The ghost is identifiable without relying on any of that machinery: it is the
 * only paragraph the block-editor store does not know about. Matching on that
 * keeps this to the empty-post case and leaves every real paragraph alone.
 *
 * If a future Gutenberg drops the ghost and restores the appender, this simply
 * stops matching, and `bodyPlaceholder` starts working again on its own.
 */
/** Fires once per editor session; the HOC wraps every block, so an instance guard would not do. */
const hasTrackedShown = { current: false };

export const withDraftAssistPlaceholder = createHigherOrderComponent(
	( BlockEdit: ComponentType< ParagraphEditProps > ) => {
		const WithDraftAssistPlaceholder = ( props: ParagraphEditProps ) => {
			const isGhostParagraph = useSelect(
				( select ) => {
					if ( props.name !== 'core/paragraph' ) {
						return false;
					}

					const store = select( 'core/block-editor' ) as
						| { getBlock?: ( clientId: string ) => unknown; getBlockCount?: () => number }
						| undefined;

					if ( typeof store?.getBlock !== 'function' ) {
						return false;
					}

					// Gutenberg builds a ghost for any empty block list, including an empty
					// Group or Columns inside a post that already has content. Requiring the
					// whole document to be empty keeps the prompt on the one canvas it means
					// — and stops it recording an impression it did not earn.
					if ( typeof store.getBlockCount === 'function' && store.getBlockCount() > 0 ) {
						return false;
					}

					// Real blocks resolve; the ghost does not exist in the store.
					return ! store.getBlock( props.clientId );
				},
				[ props.name, props.clientId ]
			);

			const postType = useSelect( ( select ) => {
				const editor = select( 'core/editor' ) as
					| { getCurrentPostType?: () => unknown }
					| undefined;
				return editor?.getCurrentPostType?.();
			}, [] );

			const shouldShowPrompt =
				isGhostParagraph && isDraftAssistEnabled() && isDraftAssistPostType( postType );

			// Recorded here rather than where the placeholder is *set*, because this is
			// where it is actually rendered. Once per editor session, not per re-render.
			useEffect( () => {
				if ( shouldShowPrompt && ! hasTrackedShown.current && isDraftAssistPostType( postType ) ) {
					hasTrackedShown.current = true;
					trackDraftAssistEntryPointShown( { contentType: postType } );
				}
			}, [ shouldShowPrompt, postType ] );

			if ( ! shouldShowPrompt ) {
				return <BlockEdit { ...props } />;
			}

			return (
				<BlockEdit
					{ ...props }
					attributes={ { ...( props.attributes ?? {} ), placeholder: getDraftPlaceholder() } }
				/>
			);
		};

		return WithDraftAssistPlaceholder;
	},
	'withDraftAssistPlaceholder'
);
