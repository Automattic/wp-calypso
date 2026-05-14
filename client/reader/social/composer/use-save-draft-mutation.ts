import { mutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface SaveDraftMutationVariables {
	siteId: number;
	content: string;
}

export interface SaveDraftMutationResult {
	ID: number;
}

// wpcom `/sites/:id/posts/new` rejects empty `content` (the limit-overflow
// path can't reach it empty, but the Fediverse media-handoff trigger
// from CM-726 does — the user clicks "Add media" with nothing typed).
// Substitute a Gutenberg empty-paragraph block so the draft is created
// and the editor opens on a clean empty post.
const EMPTY_DRAFT_PLACEHOLDER = '<!-- wp:paragraph --><p></p><!-- /wp:paragraph -->';

export function saveDraftMutation() {
	return mutationOptions< SaveDraftMutationResult, Error, SaveDraftMutationVariables >( {
		mutationKey: [ 'reader-social-composer-overflow', 'save-draft' ],
		mutationFn: ( { siteId, content } ) =>
			wpcom
				.site( siteId )
				.post()
				.add( {
					content: content.trim() === '' ? EMPTY_DRAFT_PLACEHOLDER : content,
					status: 'draft',
				} ),
	} );
}
