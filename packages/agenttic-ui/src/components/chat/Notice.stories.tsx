import type { Meta, StoryObj } from '@storybook/react';
import { Notice } from './Notice';
import { StylesIcon } from '../icons/StylesIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';

const meta = {
	title: 'Chat/Notice',
	component: Notice,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
} satisfies Meta< typeof Notice >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		message: 'This is a default notice message.',
	},
};

export const WithIcon: Story = {
	args: {
		message: 'Notice with an icon',
		icon: <StylesIcon />,
	},
};

export const WithAction: Story = {
	args: {
		message: 'Your session will expire soon.',
		action: {
			label: 'Extend Session',
			onClick: () => console.log( 'Session extended' ),
		},
	},
};

export const Dismissible: Story = {
	args: {
		message: 'Click the X to dismiss this notice.',
		dismissible: true,
		onDismiss: () => console.log( 'Notice dismissed' ),
	},
};

export const NonDismissible: Story = {
	args: {
		message: 'This notice cannot be dismissed.',
		dismissible: false,
	},
};

export const Success: Story = {
	args: {
		message: 'Operation completed successfully!',
		status: 'success',
		icon: <CheckIcon />,
	},
};

export const Warning: Story = {
	args: {
		message: 'Please review your settings before proceeding.',
		status: 'warning',
		icon: <StylesIcon />,
	},
};

export const Error: Story = {
	args: {
		message: 'An error occurred while processing your request.',
		status: 'error',
		icon: <XIcon />,
		action: {
			label: 'Retry',
			onClick: () => console.log( 'Retrying...' ),
		},
	},
};
