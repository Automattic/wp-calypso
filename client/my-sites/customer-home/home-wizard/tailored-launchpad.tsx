import page from '@automattic/calypso-router';
import { useEffect, useState } from '@wordpress/element';
import { Card, CollapsibleCard, Stack, Text, Button, Icon } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import FirstPostTaskCta from './first-post-task-item';
import LaunchTaskCta from './launch-task-item';
import ThemePickerTaskItem from './theme-picker-task-item';
import type { SelectedTask } from './select-tasks';

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

	if ( task.id === 'launch-site' ) {
		return <LaunchTaskCta task={ task } />;
	}
	if ( task.id === 'pick-theme' ) {
		return <ThemePickerTaskItem task={ task } />;
	}
	if ( FIRST_CREATION_TASK_IDS.includes( task.id ) ) {
		return <FirstPostTaskCta task={ task } />;
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

	// Land on the first incomplete task once tasks become available. This
	// runs whenever the tasks list changes (e.g. when Dolly's response lands
	// after the wizard runs and the dashboard's empty skeleton is replaced),
	// so the user always opens onto something actionable. Skipped after the
	// user manually opens a card so we don't overwrite their selection.
	useEffect( () => {
		if ( userTouched || tasks.length === 0 ) {
			return;
		}
		const firstIncomplete = tasks.find( ( task ) => ! task.completed )?.id ?? null;
		if ( firstIncomplete && firstIncomplete !== openTaskId ) {
			setOpenTaskId( firstIncomplete );
		}
	}, [ tasks, openTaskId, userTouched ] );

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
				// Completed tasks aren't expandable — there's nothing left to do.
				// Render them as a plain Card so there's no dangling chevron.
				if ( task.completed ) {
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

				// "Skip" moves the user along the checklist: collapse this card
				// and open the next one (or close everything if it was last).
				const nextTask = tasks[ index + 1 ];
				const skipToNext = () => {
					setUserTouched( true );
					setOpenTaskId( nextTask ? nextTask.id : null );
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
