import { ChatHeader } from './ChatHeader';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
	title: 'Chat/ChatHeader',
	component: ChatHeader,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		onClose: {
			action: 'closed',
			description: 'Callback when the close button is clicked',
		},
	},
} satisfies Meta< typeof ChatHeader >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {},
};
