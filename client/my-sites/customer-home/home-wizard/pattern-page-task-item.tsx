import page from '@automattic/calypso-router';
import { useState } from '@wordpress/element';
import { Button } from '@wordpress/ui';
import { useDispatch, useSelector } from 'calypso/state';
import { savePost } from 'calypso/state/posts/actions/save-post';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { fetchPatternPageRaw } from './draft-pattern-page';
import { HOME_WIZARD_STATE_PREF, type HomeWizardState } from './wizard-state';
import type { SelectedTask } from './select-tasks';
import type { AppState } from 'calypso/types';

type Props = {
	task: SelectedTask;
};

/**
 * Call to action for "pattern" tasks (e.g. "Create your first gallery").
 *
 * Clicking creates a real wpcom *page* from a WordPress.com block pattern and
 * routes to its editor — the user lands on a designed, on-brand starting point
 * instead of a blank page. The populated markup (copy rewritten by Dolly) is
 * pre-warmed at wizard finish and cached in the wizard state; on a cache miss
 * we fetch the pattern's own markup on click instead, so the user still gets a
 * real page. If page creation fails entirely we fall back to the task's
 * `resolvedUrl` (a blank page editor) so the user is never stranded.
 */
export default function PatternPageTaskCta( { task }: Props ) {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? '';
	const cached =
		(
			useSelector( ( state: AppState ) =>
				getPreference( state, HOME_WIZARD_STATE_PREF )
			) as HomeWizardState | null
		 )?.patternPages ?? {};
	const [ isCreating, setIsCreating ] = useState< boolean >( false );

	const navigateToPage = ( pageId?: number ) => {
		if ( pageId ) {
			page( `/page/${ siteSlug }/${ pageId }` );
			return;
		}
		page( task.resolvedUrl );
	};

	// No pattern metadata or no site → behave like the default CTA.
	if ( ! task.pattern || ! siteId ) {
		return (
			<Button variant="solid" tone="brand" onClick={ () => navigateToPage() }>
				{ task.cta }
			</Button>
		);
	}

	const { category, pageTitle, intro, images } = task.pattern;
	// Cache key matches what home-dashboard's prewarm wrote: PTK category when
	// present, else `intro:${pageTitle}` (intro-only tasks like gallery, which
	// don't have a PTK category to key by).
	const cacheKey = category ?? `intro:${ pageTitle }`;

	const onClick = async () => {
		if ( isCreating ) {
			return;
		}
		setIsCreating( true );
		try {
			// Prefer the pre-warmed, Dolly-rewritten markup; on a cache miss fetch
			// the pattern's own copy so the user still lands on a real page (or,
			// for intro-only tasks, an empty body the user fills via the editor).
			const prewarmed = cached[ cacheKey ];
			const patternPage =
				prewarmed ?? ( await fetchPatternPageRaw( { category, pageTitle, intro, images } ) );

			if ( ! patternPage ) {
				navigateToPage();
				return;
			}

			const savedPage = ( await dispatch(
				savePost( siteId, undefined, {
					title: patternPage.pageTitle,
					content: patternPage.html,
					type: 'page',
					status: 'draft',
				} )
				// `savePost` is a thunk that resolves to the API response — typings
				// don't propagate that fully, so cast the await result.
			) ) as unknown as { ID?: number };

			if ( savedPage?.ID ) {
				navigateToPage( savedPage.ID );
				return;
			}
			navigateToPage();
		} catch ( error ) {
			window.console?.warn?.( '[Launchpad] failed to create pattern page:', error );
			navigateToPage();
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
