import { Meta, StoryObj } from '@storybook/react';
import { Link } from '@wordpress/ui';
import Notice, { NoticeActionButton, NoticeActionLink } from './index';

const meta: Meta< typeof Notice > = {
	title: 'client/dashboard/Notice',
	component: Notice,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof Notice >;

const defaultArgs = {
	title: 'Title',
	children: (
		<>
			Hello, I’m a notice with an inline{ ' ' }
			<Link href="#" openInNewTab>
				link
			</Link>
			.
		</>
	),
	actions: (
		<>
			<NoticeActionButton variant="solid">Label</NoticeActionButton>
			<NoticeActionButton variant="outline">Label</NoticeActionButton>
			<NoticeActionLink href="#">Label</NoticeActionLink>
		</>
	),
};

export const Default: Story = {
	args: {
		...defaultArgs,
	},
};

export const Info: Story = {
	args: {
		...defaultArgs,
		variant: 'info',
	},
};

export const Warning: Story = {
	args: {
		...defaultArgs,
		variant: 'warning',
	},
};

export const Success: Story = {
	args: {
		...defaultArgs,
		variant: 'success',
	},
};

export const Error: Story = {
	args: {
		...defaultArgs,
		variant: 'error',
	},
};

export const WithoutActions: Story = {
	args: {
		...defaultArgs,
		actions: undefined,
	},
};

export const Dismissible: Story = {
	args: {
		...defaultArgs,
		onClose: () => {},
	},
};
