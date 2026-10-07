import type { ChecklistItem, ChecklistItemStatus } from '@automattic/agenttic-ui';

export const LAUNCH_CHECKLIST_TITLE = 'Launch checklist';

export const launchChecklistItems: ChecklistItem[] = [
	{
		id: 'design',
		label: 'Customize the design',
		prompt: 'Help me customize the design',
		autoSubmit: true,
	},
	{
		id: 'about',
		label: 'Publish the About page',
		prompt: 'Help me publish the About page',
		autoSubmit: true,
	},
	{
		id: 'images',
		label: 'Replace placeholder images',
		prompt: 'Help me replace the placeholder images',
		autoSubmit: true,
	},
	{
		id: 'domain',
		label: 'Add a custom domain',
		prompt: 'Help me add a custom domain',
		autoSubmit: true,
	},
	{ id: 'launch', label: 'Launch site', prompt: 'Launch my site', autoSubmit: true },
];

export type ChecklistPreset = 'fresh' | 'in-progress' | 'one-done' | 'mixed' | 'all-done';

export const CHECKLIST_PRESETS: Array< { id: ChecklistPreset; label: string } > = [
	{ id: 'fresh', label: 'Fresh (0/5)' },
	{ id: 'in-progress', label: 'In progress' },
	{ id: 'one-done', label: 'One done' },
	{ id: 'mixed', label: 'Mixed statuses' },
	{ id: 'all-done', label: 'All done' },
];

const presetStatuses: Record<
	ChecklistPreset,
	Partial< Record< string, ChecklistItemStatus > >
> = {
	fresh: {},
	'in-progress': { design: 'in_progress' },
	'one-done': { design: 'done' },
	mixed: { design: 'done', about: 'skipped', images: 'in_progress' },
	'all-done': { design: 'done', about: 'done', images: 'done', domain: 'skipped', launch: 'done' },
};

export const buildChecklist = ( preset: ChecklistPreset ): ChecklistItem[] =>
	launchChecklistItems.map( ( item ) => ( {
		...item,
		status: presetStatuses[ preset ][ item.id ] ?? 'todo',
	} ) );
