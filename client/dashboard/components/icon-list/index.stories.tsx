import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { cog, page, layout } from '@wordpress/icons';
import IconList from './index';

const meta: Meta< typeof IconList > = {
	title: 'client/dashboard/IconList',
	component: IconList,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof IconList >;

export const Default: Story = {
	args: {
		children: (
			<>
				<IconList.Item
					title="First item"
					description="First item description"
					decoration={ <Icon icon={ cog } /> }
				/>
				<IconList.Item
					title="Second item"
					description="Second item description"
					decoration={ <Icon icon={ page } /> }
				/>
				<IconList.Item
					title="Third item"
					description="Third item description"
					decoration={ <Icon icon={ layout } /> }
				/>
			</>
		),
	},
};

export const WithTitle: Story = {
	args: {
		title: 'Icon List Title',
		children: (
			<>
				<IconList.Item
					title="First item"
					description="First item description"
					decoration={ <Icon icon={ cog } /> }
				/>
				<IconList.Item
					title="Second item"
					description="Second item description"
					decoration={ <Icon icon={ page } /> }
				/>
			</>
		),
	},
};

export const WithTitleAndDescription: Story = {
	args: {
		title: 'Icon List Title',
		description: 'This is a description of the icon list',
		children: (
			<>
				<IconList.Item
					title="First item"
					description="First item description"
					decoration={ <Icon icon={ cog } /> }
				/>
				<IconList.Item
					title="Second item"
					description="Second item description"
					decoration={ <Icon icon={ page } /> }
				/>
				<IconList.Item
					title="Third item"
					description="Third item description"
					decoration={ <Icon icon={ layout } /> }
				/>
			</>
		),
	},
};

export const WithoutIcons: Story = {
	args: {
		title: 'Simple List',
		children: (
			<>
				<IconList.Item title="First item" description="First item description" />
				<IconList.Item title="Second item" description="Second item description" />
				<IconList.Item title="Third item" description="Third item description" />
			</>
		),
	},
};
