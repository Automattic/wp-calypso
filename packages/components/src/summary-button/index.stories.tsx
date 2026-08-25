import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { envelope, receipt, backup } from '@wordpress/icons';
import { SummaryButtonBadgeProps } from './types';
import SummaryButton from './index';

// Define field options for the controls.
const badgeOptions: Record< string, SummaryButtonBadgeProps[] > = {
	'Three Badges': [
		{ text: 'Active', intent: 'stable' },
		{ text: 'Auto-renew on', intent: 'informational' },
		{ text: 'Primary', intent: 'none' },
	],
	'Two Badges': [
		{ text: 'Needs attention', intent: 'medium' },
		{ text: 'Auto-renew off', intent: 'high' },
	],
	'One Badge': [ { text: 'Coming soon', intent: 'informational' } ],
	'No Badges': [],
};

const meta: Meta< typeof SummaryButton > = {
	title: 'SummaryButton',
	component: SummaryButton,
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
};

export default meta;

type Story = StoryObj< typeof SummaryButton >;

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

export const MediumLowDensity: Story = {
	args: {
		title: 'Email Configuration',
		description: 'Setup email forwarding for your domain.',
		density: 'medium-low',
		decoration: <Icon icon={ envelope } />,
		badges: badgeOptions[ 'Two Badges' ],
	},
};
