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
			// One subscription, and it returns before touching any store for a block that
			// is not a paragraph — this HOC wraps every block's edit component, so what it
			// does on the way out matters as much as what it does on the way in.
			const contentType = useSelect(
				( select ) => {
					if ( props.name !== 'core/paragraph' || ! isDraftAssistEnabled() ) {
						return null;
					}

					const blockEditor = select( 'core/block-editor' ) as
						| { getBlockCount?: () => number }
						| undefined;

					// Zero blocks in the document means nothing real is being rendered, so
					// this paragraph is Gutenberg's ghost for the empty post. That is the
					// whole test: a store lookup on the client id would also match ghosts
					// inside an empty Group in a post that already has content.
					if (
						typeof blockEditor?.getBlockCount !== 'function' ||
						blockEditor.getBlockCount() > 0
					) {
						return null;
					}

					const editor = select( 'core/editor' ) as
						| { getCurrentPostType?: () => unknown }
						| undefined;
					const postType = editor?.getCurrentPostType?.();

					return isDraftAssistPostType( postType ) ? postType : null;
				},
				[ props.name ]
			);

			const shouldShowPrompt = null !== contentType;

			// Recorded here rather than where the placeholder is *set*, because this is
			// where it is actually rendered. Once per editor session, not per re-render.
			useEffect( () => {
				if ( shouldShowPrompt && ! hasTrackedShown.current ) {
					hasTrackedShown.current = true;
					trackDraftAssistEntryPointShown( { contentType } );
				}
			}, [ shouldShowPrompt, contentType ] );

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
