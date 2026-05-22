/**
 * Dev-only "Preview all tasks" widget.
 *
 * Renders every entry in TASK_REGISTRY at once, grouped by category, so we
 * can QA the full task surface without re-running the wizard six times with
 * different goals. It is NOT part of the production flow — it's reached via
 * the dashboard FAB's "Preview all tasks" menu item.
 *
 * Fidelity matters: descriptions reproduce the exact production reframing
 * from home-dashboard.tsx (Dolly post-draft subtitle for the post-shaped
 * creation tasks; `buildPickThemeSubtitle( inferred )` for pick-theme), and
 * the ★ tasks reuse the real production sub-components — clicking them opens
 * the real theme dialog / creates the real Dolly-drafted wpcom post / fires
 * the real launch flow, identical to the live Launchpad.
 */
import page from '@automattic/calypso-router';
import { Modal } from '@wordpress/components';
import { Button, Text } from '@wordpress/ui';
import { useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';
import FirstPostTaskCta from '../first-post-task-item';
import LaunchTaskCta from '../launch-task-item';
import { buildPickThemeSubtitle } from '../recommend-themes';
import { TASK_REGISTRY, type SiteState, type TaskCategory } from '../task-registry';
import ThemePickerTaskItem from '../theme-picker-task-item';
import { HOME_WIZARD_STATE_PREF, type HomeWizardState } from '../wizard-state';
import type { SelectedTask } from '../select-tasks';
import type { AppState } from 'calypso/types';

import './style.scss';

type Props = {
	siteState: SiteState;
	onClose: () => void;
};

// Same routing the live accordion uses (see tailored-launchpad.tsx). The
// post-shaped creation tasks share one CTA component; theme + launch have
// their own; everything else is a plain navigating button.
const FIRST_CREATION_TASK_IDS = [
	'publish-first-post',
	'add-portfolio-piece',
	'send-first-newsletter',
];

// Mirror of home-dashboard.tsx's POST_DRAFT_REFRAME_IDS — the post-shaped
// rows whose description we swap for Dolly's drafted-post subtitle.
const POST_DRAFT_REFRAME_IDS = new Set( FIRST_CREATION_TASK_IDS );

const CATEGORY_ORDER: TaskCategory[] = [ 'activation', 'feature-setup', 'discover', 'growth' ];
const CATEGORY_LABELS: Record< TaskCategory, string > = {
	activation: 'Activation',
	'feature-setup': 'Feature setup',
	discover: 'Discover',
	growth: 'Growth',
};

function PreviewCta( { task }: { task: SelectedTask } ) {
	if ( task.id === 'launch-site' ) {
		return <LaunchTaskCta task={ task } />;
	}
	if ( task.id === 'pick-theme' ) {
		return <ThemePickerTaskItem task={ task } />;
	}
	if ( FIRST_CREATION_TASK_IDS.includes( task.id ) ) {
		return <FirstPostTaskCta task={ task } />;
	}
	// Filled brand-blue to match every production row's CTA. onClick + page()
	// rather than `render={ <a> }` for the same anchor-override reason noted
	// in tailored-launchpad.tsx.
	return (
		<Button variant="solid" tone="brand" onClick={ () => page( task.resolvedUrl ) }>
			{ task.cta }
		</Button>
	);
}

export default function TaskRegistryPreview( { siteState, onClose }: Props ) {
	const wizardState =
		( useSelector( ( state: AppState ) =>
			getPreference( state, HOME_WIZARD_STATE_PREF )
		) as HomeWizardState | null ) ?? {};
	const firstPostDraft = wizardState.firstPostDraft ?? null;
	const inferred = wizardState.inferred ?? null;

	const draftIsUsable =
		!! firstPostDraft &&
		typeof firstPostDraft.title === 'string' &&
		Array.isArray( firstPostDraft.paragraphs ) &&
		firstPostDraft.paragraphs.length > 0;

	// Reproduce the production description reframing exactly (home-dashboard.tsx).
	const describe = ( id: string, fallback?: string ): string | undefined => {
		if ( draftIsUsable && POST_DRAFT_REFRAME_IDS.has( id ) ) {
			return firstPostDraft?.subtitle ?? firstPostDraft?.title ?? fallback;
		}
		if ( id === 'pick-theme' ) {
			return buildPickThemeSubtitle( inferred ) ?? fallback;
		}
		return fallback;
	};

	return (
		<Modal
			title={ `Task registry preview (${ TASK_REGISTRY.length } tasks)` }
			onRequestClose={ onClose }
			size="large"
			className="task-preview"
		>
			{ CATEGORY_ORDER.map( ( category ) => {
				const templates = TASK_REGISTRY.filter( ( t ) => t.category === category );
				if ( templates.length === 0 ) {
					return null;
				}
				return (
					<section key={ category } className="task-preview__section">
						<Text variant="heading-sm" className="task-preview__section-title">
							{ CATEGORY_LABELS[ category ] } ({ templates.length })
						</Text>
						<ul className="task-preview__list">
							{ templates.map( ( template ) => {
								const task: SelectedTask = {
									...template,
									completed: false,
									resolvedUrl: template.url( siteState.siteSlug ),
								};
								const description = describe( template.id, template.subtitle );
								let audience = 'universal';
								if ( template.goals ) {
									audience = `goals: ${ template.goals.join( ', ' ) }`;
								} else if ( template.features ) {
									audience = `features: ${ template.features.join( ', ' ) }`;
								}
								return (
									<li key={ template.id } className="task-preview__row">
										<div className="task-preview__info">
											<Text variant="body-md" className="task-preview__title">
												{ template.title }
											</Text>
											{ description && (
												<Text variant="body-sm" className="task-preview__desc">
													{ description }
												</Text>
											) }
											<code className="task-preview__meta">
												{ template.id } · { audience }
											</code>
											{ /* Dev-only audit affordance: open the destination in a new
											   tab (target="_blank") so the preview modal stays put while
											   you check where each task lands. Left/right/cmd-click all
											   open a new tab. */ }
											<a
												className="task-preview__url"
												href={ task.resolvedUrl }
												target="_blank"
												rel="noreferrer"
											>
												{ task.resolvedUrl }
											</a>
										</div>
										<div className="task-preview__cta">
											<PreviewCta task={ task } />
										</div>
									</li>
								);
							} ) }
						</ul>
					</section>
				);
			} ) }
		</Modal>
	);
}
