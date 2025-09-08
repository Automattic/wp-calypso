import { Meta, StoryObj } from '@storybook/react';
import ClipboardButton from './clipboard-button';

const meta: Meta< typeof ClipboardButton > = {
	title: 'client/dashboard/domains/domain-connection-setup/ClipboardButton',
	component: ClipboardButton,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof ClipboardButton >;

export const SimpleText: Story = {
	args: {
		text: 'example.com',
	},
};

export const IPAddress: Story = {
	args: {
		text: '192.0.2.1',
	},
};

export const NameServer: Story = {
	args: {
		text: 'ns1.wordpress.com',
	},
};

export const DNSRecordValue: Story = {
	args: {
		text: '10 mail.example.com',
	},
};

export const LongText: Story = {
	args: {
		text: 'this-is-a-very-long-dns-record-value-that-might-wrap-or-truncate-depending-on-the-container-width.example.com',
	},
};

export const ShortCode: Story = {
	args: {
		text: '@',
	},
};

export const NumericValue: Story = {
	args: {
		text: '86400',
	},
};

export const URLValue: Story = {
	args: {
		text: 'https://www.example.com/path/to/resource',
	},
};

export const EmailAddress: Story = {
	args: {
		text: 'admin@example.com',
	},
};

export const WithClassName: Story = {
	args: {
		text: 'example.com',
		className: 'custom-class',
	},
};
