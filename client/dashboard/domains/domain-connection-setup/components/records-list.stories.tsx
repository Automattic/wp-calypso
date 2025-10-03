import { Meta, StoryObj } from '@storybook/react';
import RecordsList from './records-list';
import type { DNSRecord } from '../types';

const meta: Meta< typeof RecordsList > = {
	title: 'client/dashboard/domains/domain-connection-setup/RecordsList',
	component: RecordsList,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
};

export default meta;

type Story = StoryObj< typeof RecordsList >;

const sampleARecords: DNSRecord[] = [
	{
		type: 'A',
		name: '@',
		value: '192.0.2.1',
	},
	{
		type: 'A',
		name: 'www',
		value: '192.0.2.1',
	},
];

const sampleCNameRecords: DNSRecord[] = [
	{
		type: 'CNAME',
		name: 'www',
		value: 'example.com',
	},
	{
		type: 'CNAME',
		name: 'blog',
		value: 'example.com',
	},
];

const sampleNSRecords: DNSRecord[] = [
	{
		type: 'NS',
		name: '@',
		value: 'ns1.wordpress.com',
	},
	{
		type: 'NS',
		name: '@',
		value: 'ns2.wordpress.com',
	},
	{
		type: 'NS',
		name: '@',
		value: 'ns3.wordpress.com',
	},
];

const mixedRecords: DNSRecord[] = [
	{
		type: 'A',
		name: '@',
		value: '192.0.2.1',
	},
	{
		type: 'CNAME',
		name: 'www',
		value: 'example.com',
	},
	{
		type: 'MX',
		name: '@',
		value: '10 mail.example.com',
	},
];

export const WithARecords: Story = {
	args: {
		records: sampleARecords,
	},
};

export const WithCNameRecords: Story = {
	args: {
		records: sampleCNameRecords,
	},
};

export const WithNameServers: Story = {
	args: {
		records: sampleNSRecords,
	},
};

export const WithMixedRecords: Story = {
	args: {
		records: mixedRecords,
	},
};

export const JustValues: Story = {
	args: {
		records: sampleNSRecords,
		justValues: true,
	},
};

export const SingleRecord: Story = {
	args: {
		records: [
			{
				type: 'A',
				name: '@',
				value: '192.0.2.1',
			},
		],
	},
};

export const EmptyRecords: Story = {
	args: {
		records: [],
	},
};
