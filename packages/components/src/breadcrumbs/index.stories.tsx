import { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './';

const meta: Meta< typeof Breadcrumbs > = {
	title: 'Breadcrumbs',
	component: Breadcrumbs,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
		// Prevent flickering + automatic menu closing in compact mode.
		layout: 'fullscreen',
	},
	decorators: [
		( Story ) => (
			<div style={ { paddingInlineStart: '1rem', paddingBlockStart: '1rem' } }>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj< typeof Breadcrumbs >;

export const Default: Story = {
	args: {
		items: [
			{ label: 'Home', href: 'javascript:void(0)' },
			{ label: 'Products', href: 'javascript:void(0)' },
			{ label: 'Electronics', href: 'javascript:void(0)' },
			{ label: 'Computers', href: 'javascript:void(0)' },
		],
	},
};

export const WithCurrentItemVisible: Story = {
	args: {
		...Default.args,
		showCurrentItem: true,
	},
};

export const WithLongPath: Story = {
	args: {
		...Default.args,
		items: [
			{ label: 'Home', href: 'javascript:void(0)' },
			{ label: 'Products', href: 'javascript:void(0)' },
			{ label: 'Electronics', href: 'javascript:void(0)' },
			{ label: 'Computers', href: 'javascript:void(0)' },
			{ label: 'Laptops', href: 'javascript:void(0)' },
			{ label: 'Gaming', href: 'javascript:void(0)' },
			{ label: '17 inch', href: 'javascript:void(0)' },
			{
				label: 'Alienware X17',
				href: 'javascript:void(0)',
			},
		],
	},
};

export const WithCustomItem: Story = {
	args: {
		...Default.args,
		renderItemLink: ( { label, href, ...props } ) => {
			const onClick = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
				props.onClick?.( event );
				event.preventDefault();
				// eslint-disable-next-line no-console
				console.log( `Router navigation to ${ label }` );
			};

			return (
				<a href={ href } { ...props } onClick={ onClick }>
					{ label }
				</a>
			);
		},
	},
};
