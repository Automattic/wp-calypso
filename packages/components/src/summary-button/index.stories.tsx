import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { envelope, receipt, backup } from '@wordpress/icons';
import { SummaryButtonBadgeProps } from './types';
import SummaryButton from './index';

// Define field options for the controls.
const badgeOptions: Record< string, SummaryButtonBadgeProps[] > = {
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
	title: 'packages/components/SummaryButton',
	component: SummaryButton,
	tags: [ 'autodocs' ],
	argTypes: {
		decoration: {
			control: 'select',
			options: [ 'envelope', 'receipt', 'backup', 'image' ],
			mapping: {
				envelope: <Icon icon={ envelope } />,
				receipt: <Icon icon={ receipt } />,
				backup: <Icon icon={ backup } />,
				image: <img src="https://live.staticflickr.com/5725/21726228300_51333bd62c_b.jpg" alt="" />,
			},
		},
		badges: {
			control: 'select',
			options: Object.keys( badgeOptions ),
			mapping: badgeOptions,
			description: 'Pre-defined badge sets to display',
		},
	},
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
} satisfies Meta< typeof SummaryButton >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Domain Settings',
		description: 'Manage your domain settings, DNS, email, and more.',
		badges: badgeOptions[ 'Two Badges' ],
	},
};

export const LowDensity: Story = {
	args: {
		title: 'Domain Settings',
		description: 'Manage your domain settings, DNS, email, and more.',
		strapline: 'Some settings require attention',
		density: 'low',
		decoration: <Icon icon={ receipt } />,
		badges: badgeOptions[ 'Three Badges' ],
	},
};

export const MediumDensity: Story = {
	args: {
		title: 'Email Configuration',
		description: 'Setup email forwarding for your domain.',
		density: 'medium',
		decoration: <Icon icon={ envelope } />,
		badges: badgeOptions[ 'Two Badges' ],
	},
};
