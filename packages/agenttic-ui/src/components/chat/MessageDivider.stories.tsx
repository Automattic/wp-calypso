import { MessageDivider } from './MessageDivider';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
	title: 'Chat/MessageDivider',
	component: MessageDivider,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		message: {
			control: 'text',
			description: 'The message to display in the divider',
		},
	},
} satisfies Meta< typeof MessageDivider >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		message: 'New Messages',
	},
};
