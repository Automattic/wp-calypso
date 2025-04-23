import NavigationHeader from '../navigation-header';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof NavigationHeader > = {
	title: 'Components/NavigationHeader',
	component: NavigationHeader,
	parameters: {
		layout: 'fullscreen',
	},
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof NavigationHeader >;

// Basic header with title only
export const Basic: Story = {
	args: {
		title: 'Basic Header',
	},
};

// Header with back button
export const WithBackButton: Story = {
	args: {
		title: 'Header with Back',
		backLink: '/previous-page',
		backLinkText: 'Back to Dashboard',
	},
};

// Header with action button
export const WithActionButton: Story = {
	args: {
		title: 'Post Details',
		buttonProps: {
			text: 'View Post',
			onClick: () => null,
		},
	},
};

// Header with download link
export const WithDownloadLink: Story = {
	args: {
		title: 'Summary Page',
		downloadProps: {
			href: '/data.csv',
			text: 'Download CSV',
			download: true,
		},
	},
};

// Header with custom right element
export const WithCustomRightElement: Story = {
	args: {
		title: 'Custom Header',
		rightElement: (
			<div style={ { display: 'flex', gap: '8px' } }>
				<button>Custom Button 1</button>
				<button>Custom Button 2</button>
			</div>
		),
	},
};

// Header with back button and action button
export const WithBackAndAction: Story = {
	args: {
		title: 'Complex Header',
		backLink: '/previous-page',
		backLinkText: 'Back',
		buttonProps: {
			text: 'Save Changes',
			onClick: () => null,
		},
	},
};

// Mobile view example
export const MobileView: Story = {
	args: {
		title: 'Mobile Header',
		backLink: '/previous-page',
		buttonProps: {
			text: 'Action',
		},
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
	},
};
