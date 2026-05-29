import page from '@automattic/calypso-router';
import { useEffect, useState } from '@wordpress/element';
import { Card, CollapsibleCard, Stack, Text, Button, Icon } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import FirstPostTaskCta from './first-post-task-item';
import LaunchTaskCta from './launch-task-item';
import { LAUNCHPAD_GENERIC_HASH, buildLaunchpadEditorUrl } from './launchpad-editor-url';
import PatternPageTaskCta from './pattern-page-task-item';
import ThemePickerTaskItem from './theme-picker-task-item';
import type { SelectedTask } from './select-tasks';
import type { AppState } from 'calypso/types';

import './tailored-launchpad.scss';

type Props = {
	tasks: SelectedTask[];
};

const FIRST_CREATION_TASK_IDS = [
	'publish-first-post',
	'add-portfolio-piece',
	'send-first-newsletter',
];

// WPDS doesn't ship a "todo / dashed-circle" or "check-in-circle" icon yet
// (only `check`), so we inline both. Sized for @wordpress/ui Icon's default
// 24px viewBox; `currentColor` lets us tone them via CSS.
const taskActiveIcon = (
	<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2.5" />
	</svg>
);

const taskDoneIcon = (
	<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
		<path
			d="M8 12.5L11 15.5L16 9.5"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * The task-specific call to action shown inside an expanded card. Most tasks
 * are a plain link to a Calypso route; launch, theme picker, and first-
 * creation tasks route through their own components.
 */
function TaskCta( { task }: { task: SelectedTask } ) {
	const translate = useTranslate();
	const siteId = useSelector( ( state: AppState ) => getSelectedSite( state )?.ID ?? null );
	const siteAdminUrl = useSelector( ( state: AppState ) => getSiteAdminUrl( state, siteId ) );

	if ( task.id === 'launch-site' ) {
		return <LaunchTaskCta task={ task } />;
	}
	if ( task.id === 'pick-theme' ) {
		return <ThemePickerTaskItem task={ task } />;
	}
	if ( FIRST_CREATION_TASK_IDS.includes( task.id ) ) {
		return <FirstPostTaskCta task={ task } />;
	}
	if ( task.pattern ) {
		return <PatternPageTaskCta task={ task } />;
	}
	// "Connect your social accounts" → Jetpack Social in wp-admin (the modern
	// destination on wpcom sites). The registry's `url` is `/marketing/connections`
	// — the older Calypso Sharing UI — kept as a fallback when `siteAdminUrl`
	// isn't loaded yet. Hard-navigation (not page()) because the destination is
	// outside Calypso.
	if ( task.id === 'connect-social-accounts' && siteAdminUrl ) {
		return (
			<Button
				variant="solid"
				tone="brand"
				onClick={ () => {
					window.location.href = `${ siteAdminUrl }admin.php?page=jetpack-social`;
				} }
			>
				{ task.cta || ( translate( 'Get started' ) as string ) }
			</Button>
		);
	}
	// Page-creating tasks (About, Contact, Forms, Video, …): open the wp-admin
	// "new page" editor directly with the `#launchpad-next-steps` hash so the
	// post-publish snackbar fires with a "Next steps" action back to /home.
	// Calypso's `/page/:slug` redirect drops `#hash` fragments, so we bypass it.
	// Pattern tasks (gallery, events) handle the snackbar themselves via
	// PatternPageTaskCta — they're routed earlier in this function.
	if ( task.createsPage && siteAdminUrl ) {
		return (
			<Button
				variant="solid"
				tone="brand"
				onClick={ () => {
					window.location.href = buildLaunchpadEditorUrl( {
						siteAdminUrl,
						postType: 'page',
						hash: LAUNCHPAD_GENERIC_HASH,
					} );
				} }
			>
				{ task.cta || ( translate( 'Get started' ) as string ) }
			</Button>
		);
	}
	// Use onClick + page() instead of `render={ <a> }` — Calypso's global
	// anchor styles override the @wordpress/ui Button's brand-tone background
	// when the Button is rendered as <a>, leaving a near-invisible CTA.
	return (
		<Button variant="solid" tone="brand" onClick={ () => page( task.resolvedUrl ) }>
			{ task.cta || ( translate( 'Get started' ) as string ) }
		</Button>
	);
}

/**
 * The tailored Launchpad checklist, rendered as an accordion: one task is
 * expanded at a time, revealing its subtitle and call to action. The first
 * incomplete task opens by default; opening another collapses the current
 * one (the @wordpress/ui CollapsibleCard handles the expand/collapse
 * animation). "Skip" advances to the next task without leaving the page.
 *
 * Completed tasks render as plain (non-collapsible) cards with a check mark.
 */
export default function TailoredLaunchpad( { tasks }: Props ) {
	const translate = useTranslate();

	// Accordion state: the id of the currently expanded task, or null when
	// every card is collapsed.
	const [ openTaskId, setOpenTaskId ] = useState< string | null >( null );
	// User-interaction tracker: once they click on a card, stop auto-syncing.
	// Otherwise a re-render with a new `tasks` array would yank focus back to
	// the first task and surprise them.
	const [ userTouched, setUserTouched ] = useState< boolean >( false );
	// Tasks the user skipped this session. Skipped tasks render with the same
	// resolved (struck-through) treatment as completed ones. Session-only by
	// design — a reload clears it and the task returns to the list.
	const [ skippedIds, setSkippedIds ] = useState< Set< string > >( () => new Set() );

	const isResolved = ( task: SelectedTask ) => task.completed || skippedIds.has( task.id );

	// Land on the first incomplete task once tasks become available. This
	// runs whenever the tasks list changes (e.g. when Dolly's response lands
	// after the wizard runs and the dashboard's empty skeleton is replaced),
	// so the user always opens onto something actionable. Skipped after the
	// user manually opens a card so we don't overwrite their selection.
	useEffect( () => {
		if ( userTouched || tasks.length === 0 ) {
			return;
		}
		const firstUnresolved =
			tasks.find( ( task ) => ! task.completed && ! skippedIds.has( task.id ) )?.id ?? null;
		if ( firstUnresolved && firstUnresolved !== openTaskId ) {
			setOpenTaskId( firstUnresolved );
		}
	}, [ tasks, openTaskId, userTouched, skippedIds ] );

	// When the currently-open task becomes resolved — e.g. the user activated a
	// theme (which marks "pick-theme" complete) — advance to the first remaining
	// unresolved task so they always have something open to act on. Runs even
	// after `userTouched`: completing a task is an explicit "I'm ready for the
	// next step" signal, unlike a passive tasks-array re-render.
	useEffect( () => {
		if ( ! openTaskId ) {
			return;
		}
		const openTask = tasks.find( ( task ) => task.id === openTaskId );
		if ( openTask && ( openTask.completed || skippedIds.has( openTask.id ) ) ) {
			const firstUnresolved =
				tasks.find( ( task ) => ! task.completed && ! skippedIds.has( task.id ) )?.id ?? null;
			setOpenTaskId( firstUnresolved );
		}
	}, [ tasks, openTaskId, skippedIds ] );

	if ( tasks.length === 0 ) {
		return (
			<Text variant="body-md">
				{ translate( "You're all set — nothing to set up right now." ) }
			</Text>
		);
	}

	return (
		<div className="tailored-launchpad">
			{ tasks.map( ( task, index ) => {
				// Resolved tasks (completed OR skipped) aren't expandable — there's
				// nothing left to do. Render them as a plain Card so there's no
				// dangling chevron. Skipped tasks intentionally look identical to
				// completed ones.
				if ( isResolved( task ) ) {
					return (
						<Card.Root key={ task.id } className="tailored-launchpad__card is-completed">
							<Card.Header>
								<Stack direction="row" align="center" gap="sm">
									<Icon icon={ taskDoneIcon } className="tailored-launchpad__icon is-done" />
									<Card.Title className="tailored-launchpad__title is-done">
										{ task.title }
									</Card.Title>
								</Stack>
							</Card.Header>
						</Card.Root>
					);
				}

				// "Skip" resolves this card (it takes the same struck-through style
				// as a completed task) and advances to the next unresolved task —
				// or closes everything if none remain.
				const skipToNext = () => {
					setUserTouched( true );
					setSkippedIds( ( prev ) => {
						const next = new Set( prev );
						next.add( task.id );
						return next;
					} );
					const nextUnresolved = tasks
						.slice( index + 1 )
						.find( ( candidate ) => ! candidate.completed && ! skippedIds.has( candidate.id ) );
					setOpenTaskId( nextUnresolved ? nextUnresolved.id : null );
				};

				return (
					<CollapsibleCard.Root
						key={ task.id }
						className="tailored-launchpad__card"
						open={ openTaskId === task.id }
						onOpenChange={ ( open ) => {
							setUserTouched( true );
							setOpenTaskId( open ? task.id : null );
						} }
					>
						<CollapsibleCard.Header>
							<Stack direction="row" align="center" gap="sm">
								<Icon icon={ taskActiveIcon } className="tailored-launchpad__icon" />
								<Card.Title>{ task.title }</Card.Title>
							</Stack>
						</CollapsibleCard.Header>
						<CollapsibleCard.Content>
							<Stack direction="column" gap="xl" className="tailored-launchpad__body">
								{ task.subtitle && (
									<Text variant="body-md" className="tailored-launchpad__subtitle">
										{ task.subtitle }
									</Text>
								) }
								<Stack
									direction="row"
									align="center"
									justify="space-between"
									gap="sm"
									className="tailored-launchpad__cta"
								>
									<TaskCta task={ task } />
									<Button variant="minimal" tone="neutral" onClick={ skipToNext }>
										{ translate( 'Skip' ) }
									</Button>
								</Stack>
							</Stack>
						</CollapsibleCard.Content>
					</CollapsibleCard.Root>
				);
			} ) }
		</div>
	);
}
