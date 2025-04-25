import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { envelope, receipt, backup } from '@wordpress/icons';
import { SummaryButtonFieldProps } from './types';
import SummaryButton from './index';

// Define field options for the controls
const fieldOptions: Record< string, SummaryButtonFieldProps[] > = {
	'Three Badges': [
		{ text: 'Active', intent: 'success' },
		{ text: 'Auto-renew on', intent: 'info' },
		{ text: 'Primary', intent: 'default' },
	],
	'Two Badges': [
		{ text: 'Needs attention', intent: 'warning' },
		{ text: 'Auto-renew off', intent: 'error' },
	],
	'One Badge': [ { text: 'Coming soon', intent: 'info' } ],
	'No Badges': [],
};

const meta = {
	title: 'Dashboard/SummaryButton',
	component: SummaryButton,
	tags: [ 'autodocs' ],
	argTypes: {
		decoration: {
			control: 'select',
			options: [ 'envelope', 'receipt', 'backup' ],
			mapping: {
				envelope: <Icon icon={ envelope } />,
				receipt: <Icon icon={ receipt } />,
				backup: <Icon icon={ backup } />,
			},
		},
		fields: {
			control: 'select',
			options: Object.keys( fieldOptions ),
			mapping: fieldOptions,
			description: 'Pre-defined badge sets to display',
		},
		density: {
			control: 'radio',
			options: [ 'low', 'medium' ],
		},
	},
} satisfies Meta< typeof SummaryButton >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Domain Settings',
		description: 'Manage your domain settings, DNS, email, and more.',
		onClick: () => alert( 'Clicked!' ),
		fields: fieldOptions[ 'Two Badges' ],
	},
};

export const LowDensity: Story = {
	args: {
		title: 'Domain Settings',
		description: 'Manage your domain settings, DNS, email, and more.',
		strapline: 'Some settings require attention',
		density: 'low',
		decoration: <Icon icon={ receipt } />,
		fields: fieldOptions[ 'Three Badges' ],
		leadsToNestedPage: true,
		onClick: () => alert( 'Clicked low density!' ),
	},
};

export const MediumDensity: Story = {
	args: {
		title: 'Email Configuration',
		description: 'Setup email forwarding for your domain.',
		density: 'medium',
		decoration: <Icon icon={ envelope } />,
		fields: fieldOptions[ 'Two Badges' ],
		onClick: () => alert( 'Clicked medium density!' ),
	},
};
