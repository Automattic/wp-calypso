import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { cog, page, layout } from '@wordpress/icons';
import { Card, CardBody } from '../card';
import IconList from './index';

const meta: Meta< typeof IconList > = {
	title: 'client/dashboard/IconList',
	component: IconList,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof IconList >;

export const Standalone: Story = {
	args: {
		children: (
			<>
				<IconList.Item
					title="Settings"
					description="Manage your site settings"
					decoration={ <Icon icon={ cog } /> }
				/>
				<IconList.Item
					title="Pages"
					description="Create and manage pages"
					decoration={ <Icon icon={ page } /> }
				/>
				<IconList.Item
					title="Layout"
					description="Customize your site layout"
					decoration={ <Icon icon={ layout } /> }
				/>
			</>
		),
	},
};

export const InCard: Story = {
	render: () => (
		<Card>
			<CardBody>
				<IconList>
					<IconList.Item
						title="Settings"
						description="Manage your site settings"
						decoration={ <Icon icon={ cog } /> }
					/>
					<IconList.Item
						title="Pages"
						description="Create and manage pages"
						decoration={ <Icon icon={ page } /> }
					/>
					<IconList.Item
						title="Layout"
						description="Customize your site layout"
						decoration={ <Icon icon={ layout } /> }
					/>
				</IconList>
			</CardBody>
		</Card>
	),
};
