import { action } from '@storybook/addon-actions';
import { Card, CardBody } from '@wordpress/components';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';
import type { Meta, StoryObj } from '@storybook/react';
import './styles.scss';

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
					<CardBody className="domains-management__name-servers">
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
		serviceName: 'WordPress.com',
		nameservers: [],
		isBusy: false,
		showUpsellNudge: false,
		onSubmit: action( 'onSubmit' ),
	},
};

export const WithNameservers: Story = {
	args: {
		domainName: 'example.com',
		serviceName: 'WordPress.com',
		nameservers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		isBusy: false,
		showUpsellNudge: false,
		onSubmit: action( 'onSubmit' ),
	},
};

export const WithUpsellNudge: Story = {
	args: {
		domainName: 'example.com',
		serviceName: 'WordPress.com',
		nameservers: [],
		isBusy: false,
		showUpsellNudge: true,
		onSubmit: action( 'onSubmit' ),
	},
};

export const IsBusy: Story = {
	args: {
		domainName: 'example.com',
		serviceName: 'WordPress.com',
		nameservers: [],
		isBusy: true,
		showUpsellNudge: false,
		onSubmit: action( 'onSubmit' ),
	},
};

export const WithError: Story = {
	args: {
		domainName: 'example.com',
		serviceName: 'WordPress.com',
		nameservers: [],
		isBusy: false,
		showUpsellNudge: false,
		queryError: 'An error occurred while fetching nameservers.',
		onSubmit: action( 'onSubmit' ),
	},
};
