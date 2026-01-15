import { action } from '@storybook/addon-actions';
import { Card, CardBody } from '../../components/card';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof NameServersForm > = {
	title: 'Domains/NameServersForm',
	component: NameServersForm,
	parameters: {
		layout: 'none',
	},
	tags: [ 'autodocs' ],
	decorators: [
		( Story ) => (
			<PageLayout size="small">
				<Card>
					<CardBody>
						<Story />
					</CardBody>
				</Card>
			</PageLayout>
		),
	],
};

export default meta;
type Story = StoryObj< typeof NameServersForm >;

export const Default: Story = {
	args: {
		domainName: 'example.com',
		domainSiteSlug: 'example.wordpress.com',
		defaultNameServers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		nameServers: [],
		isBusy: false,
		showUpsellNudge: false,
		onSubmit: action( 'onSubmit' ),
	},
};

export const WithNameservers: Story = {
	args: {
		domainName: 'example.com',
		domainSiteSlug: 'example.wordpress.com',
		defaultNameServers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		nameServers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		isBusy: false,
		showUpsellNudge: false,
		onSubmit: action( 'onSubmit' ),
	},
};

export const WithUpsellNudge: Story = {
	args: {
		domainName: 'example.com',
		domainSiteSlug: 'example.wordpress.com',
		defaultNameServers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		nameServers: [],
		isBusy: false,
		showUpsellNudge: true,
		onSubmit: action( 'onSubmit' ),
	},
};

export const IsBusy: Story = {
	args: {
		domainName: 'example.com',
		domainSiteSlug: 'example.wordpress.com',
		defaultNameServers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		nameServers: [],
		isBusy: true,
		showUpsellNudge: false,
		onSubmit: action( 'onSubmit' ),
	},
};
