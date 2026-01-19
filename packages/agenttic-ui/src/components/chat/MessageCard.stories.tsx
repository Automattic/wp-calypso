import type { Meta, StoryObj } from '@storybook/react';
import { MessageCard } from './MessageCard';

const meta = {
	title: 'Chat/MessageCard',
	component: MessageCard,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		title: {
			control: 'text',
			description: 'The title of the card',
		},
		description: {
			control: 'text',
			description: 'The description of the card',
		},
		url: {
			control: 'text',
			description:
				'Optional URL the card links to. When provided, displays a chevron icon.',
		},
	},
} satisfies Meta< typeof MessageCard >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Example Card',
		description: 'This is an example card with a title and description',
		url: 'https://example.com',
	},
};

export const WithoutDescription: Story = {
	args: {
		title: 'Card Without Description',
		url: 'https://example.com',
	},
};

export const WithoutUrl: Story = {
	args: {
		title: 'Card Without URL',
		description:
			'This card has no URL, so it displays as a div without a chevron',
	},
};
