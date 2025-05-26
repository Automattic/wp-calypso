import { Meta, StoryObj } from '@storybook/react';
import { Button } from '@wordpress/components';
import { Callout } from '../callout';
import { PageHeader } from '../page-header';
import PageLayout from '../page-layout';
import { CalloutOverlay } from './index';

const meta = {
	title: 'client/dashboard/CalloutOverlay',
	component: CalloutOverlay,
	tags: [ 'autodocs' ],
	decorators: [
		( Story ) => (
			<>
				<p>You can focus between these form elements and the callout content</p>
				<label htmlFor="name">Name</label>
				<input type="text" id="name" />
				<button style={ { display: 'block', border: '1px solid black' } }>Click Me</button>
				<p>Things below this line can not be focused or clicked</p>
				<hr />
				<PageLayout header={ <PageHeader title="Inert content" /> }>
					<Story />
				</PageLayout>
			</>
		),
	],
} satisfies Meta< typeof CalloutOverlay >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		showCallout: true,
		callout: (
			<Callout
				title="Let our WordPress.com experts build your site!"
				description={
					<p>
						Hire our dedicated experts to build a handcrafted, personalized website. Share some
						details about what you’re looking for, and we’ll make it happen.
					</p>
				}
				actions={
					<Button __next40pxDefaultSize variant="primary">
						Get started
					</Button>
				}
				imageSrc="https://live.staticflickr.com/3277/2938134470_c807dc3e47_b.jpg"
				imageAlt="Sweet eyed kitty"
			/>
		),
		main: (
			<>
				<p>You can not focus or click these form elements</p>
				<label htmlFor="name">Name</label>
				<input type="text" id="name" />
				<button style={ { display: 'block', border: '1px solid black' } }>Click Me</button>
			</>
		),
	},
};
