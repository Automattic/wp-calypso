import page from '@automattic/calypso-router';
import { useState } from '@wordpress/element';
import { Button } from '@wordpress/ui';
import { useDispatch, useSelector } from 'calypso/state';
import { savePost } from 'calypso/state/posts/actions/save-post';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { FIRST_POST_HASH, buildLaunchpadEditorUrl } from './launchpad-editor-url';
import { HOME_WIZARD_STATE_PREF, type HomeWizardState } from './wizard-state';
import type { SelectedTask } from './select-tasks';
import type { AppState } from 'calypso/types';

type Props = {
	task: SelectedTask;
};

function escapeHtml( text: string ): string {
	return text.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

/**
 * Convert plain paragraphs to Gutenberg block markup so the editor parses
 * them as proper paragraph blocks instead of one HTML lump.
 */
function paragraphsToBlockMarkup( paragraphs: string[] ): string {
	return paragraphs
		.map(
			( paragraph ) =>
				`<!-- wp:paragraph -->\n<p>${ escapeHtml( paragraph ) }</p>\n<!-- /wp:paragraph -->`
		)
		.join( '\n\n' );
}

/**
 * Call to action for the "first creation" tasks (publish first post / add
 * portfolio piece / send first newsletter), shown inside the task's
 * expanded Launchpad card.
 *
 * When Dolly's starter draft is cached in the wizard state, clicking the
 * button creates a real wpcom draft pre-populated with the title +
 * paragraphs and routes to its editor — the user lands on a draft instead
 * of a blank page. If the draft is missing (Dolly hadn't returned, errored,
 * or the user finished the wizard before this feature shipped), the button
 * falls back to a plain link to a blank editor.
 */
export default function FirstPostTaskCta( { task }: Props ) {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const siteAdminUrl = useSelector( ( state: AppState ) =>
		siteId ? getSiteAdminUrl( state, siteId ) : null
	);
	const draft =
		(
			useSelector( ( state: AppState ) =>
				getPreference( state, HOME_WIZARD_STATE_PREF )
			) as HomeWizardState | null
		 )?.firstPostDraft ?? null;
	const [ isCreating, setIsCreating ] = useState< boolean >( false );

	const hasUsableDraft =
		!! draft &&
		typeof draft.title === 'string' &&
		Array.isArray( draft.paragraphs ) &&
		draft.paragraphs.length > 0;

	// For the publish-first-post task, open the editor at its real wpcom URL
	// with the `#publish-first-post` hash (+ `origin`) so the wpcom-block-editor
	// "Well done publishing your first post!" snackbar fires after the user
	// publishes — its "Next steps" action links back to /home (Site Setup).
	// Calypso's /post route redirects via window.location.replace and drops the
	// hash, so we navigate to the editor URL directly. Other creation tasks
	// (portfolio / newsletter) keep the standard in-Calypso navigation; the
	// editor feature self-gates on post type === 'post' anyway.
	const navigateToEditor = ( postId?: number ) => {
		if ( task.id === 'publish-first-post' && siteAdminUrl ) {
			window.location.href = buildLaunchpadEditorUrl( {
				siteAdminUrl,
				postId,
				postType: 'post',
				hash: FIRST_POST_HASH,
			} );
			return;
		}
		if ( postId ) {
			page( `/post/${ siteSlug }/${ postId }` );
			return;
		}
		page( task.resolvedUrl );
	};

	// No draft yet (or no site) → behave like the default CTA: a plain
	// client-side navigation to a blank editor. Uses onClick + page() rather
	// than `render={ <a> }` because Calypso's global anchor styles override
	// the @wordpress/ui Button's brand-tone background, leaving the CTA
	// near-invisible when rendered as an <a>.
	if ( ! hasUsableDraft || ! siteId ) {
		return (
			<Button variant="solid" tone="brand" onClick={ () => navigateToEditor() }>
				{ task.cta }
			</Button>
		);
	}

	const onClick = async () => {
		if ( isCreating ) {
			return;
		}
		setIsCreating( true );
		try {
			const content = paragraphsToBlockMarkup( draft!.paragraphs );
			const savedPost = ( await dispatch(
				savePost( siteId, undefined, {
					title: draft!.title,
					content,
					status: 'draft',
				} )
				// `savePost` is a thunk that resolves to the API response —
				// typings don't propagate that fully, so cast the await result.
			) ) as unknown as { ID?: number };
			if ( savedPost?.ID ) {
				navigateToEditor( savedPost.ID );
				return;
			}
			// API returned no ID — drop to a blank editor so the user isn't stranded.
			navigateToEditor();
		} catch ( error ) {
			window.console?.warn?.( '[Launchpad] failed to create starter draft:', error );
			navigateToEditor();
		} finally {
			setIsCreating( false );
		}
	};

	return (
		<Button variant="solid" tone="brand" loading={ isCreating } onClick={ onClick }>
			{ task.cta }
		</Button>
	);
}
