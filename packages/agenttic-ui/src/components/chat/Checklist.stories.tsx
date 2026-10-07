import { useState } from 'react';
import { Checklist } from './Checklist';
import type { ChecklistItem } from '../../types';
import type { Meta, StoryObj } from '@storybook/react';

const launchItems: ChecklistItem[] = [
	{ id: 'design', label: 'Customize the design', prompt: 'Help me customize the design' },
	{ id: 'about', label: 'Publish the About page', prompt: 'Help me publish the About page' },
	{ id: 'images', label: 'Replace placeholder images', prompt: 'Help me replace the images' },
	{ id: 'domain', label: 'Add a custom domain', prompt: 'Help me add a custom domain' },
	{ id: 'launch', label: 'Launch site', prompt: 'Launch my site' },
];

const withStatus = (
	statuses: Partial< Record< string, ChecklistItem[ 'status' ] > >
): ChecklistItem[] =>
	launchItems.map( ( item ) => ( { ...item, status: statuses[ item.id ] ?? 'todo' } ) );

const meta = {
	title: 'Chat/Checklist',
	component: Checklist,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A task list rendered inside the chat. Open tasks submit like suggestions; done and skipped tasks are inert. Clicking a task collapses the list down to whatever is in progress.',
			},
		},
	},
	args: {
		title: 'Launch checklist',
		items: launchItems,
	},
	render: ( args ) => (
		<div style={ { maxWidth: 320 } }>
			<Checklist { ...args } />
		</div>
	),
} satisfies Meta< typeof Checklist >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Fresh: Story = {};

export const OneDone: Story = {
	args: { items: withStatus( { design: 'done' } ) },
};

export const InProgressCollapsed: Story = {
	args: { items: withStatus( { design: 'in_progress' } ), defaultCollapsed: true },
};

export const MixedStatuses: Story = {
	args: {
		items: withStatus( { design: 'done', about: 'skipped', images: 'in_progress' } ),
	},
};

export const WithDisabledTask: Story = {
	args: {
		items: [
			...withStatus( { design: 'done' } ),
			{
				id: 'products',
				label: 'Add your first products',
				prompt: 'Add products',
				disabled: true,
				disabledReason: 'Install WooCommerce first',
			},
		],
	},
};

export const AllDone: Story = {
	args: {
		items: withStatus( {
			design: 'done',
			about: 'done',
			images: 'done',
			domain: 'skipped',
			launch: 'done',
		} ),
	},
};

// Selecting a task marks it in progress; a second click on the header
// re-expands the list. Mirrors how a host would drive statuses from its data.
function InteractiveChecklist( args: React.ComponentProps< typeof Checklist > ) {
	const [ items, setItems ] = useState( args.items );
	return (
		<div style={ { maxWidth: 320 } }>
			<Checklist
				{ ...args }
				items={ items }
				onSubmit={ ( selected ) =>
					setItems( ( current ) =>
						current.map( ( item ) =>
							item.id === selected.id ? { ...item, status: 'in_progress' } : item
						)
					)
				}
			/>
		</div>
	);
}

export const Interactive: Story = {
	render: ( args ) => <InteractiveChecklist { ...args } />,
};
