/**
 * External dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
/**
 * Internal dependencies
 */
import { Link } from '../';
import { browserHistory, RouterProvider, useLocation } from '../../../';
import type { Meta, StoryObj } from '@storybook/react';
import './style.stories.scss';

const meta: Meta< typeof Link > = {
	title: 'Components/Link',
	component: Link,
	tags: [ 'autodocs' ],
	decorators: [
		function WithRouterProvider( Story ) {
			return (
				<RouterProvider routes={ [] } pathArg="p">
					<Story />
				</RouterProvider>
			);
		},
	],
};

export default meta;

type Story = StoryObj< typeof Link >;

export const Default: Story = {
	args: {
		to: '/home',
		children: 'Homepage',
		className: 'story-link',
	},
	parameters: {
		docs: {
			description: {
				story:
					'The Link component enables navigation between routes in the application, maintaining state and avoiding full page reloads.',
			},
		},
	},
};

export const PassCustomState: Story = {
	args: {
		to: '/home',
		children: 'Request lucky number!',
	},

	parameters: {
		docs: {
			description: {
				story: `This story shows how to pass custom state to the Link component using the options prop.<br />
Each time the user clicks the link, a new _lucky number_ is generated and passed along.<br />
You can see how the state is preserved when navigating back and forth.`,
			},
		},
	},

	render: function Template( args ) {
		useLocation();

		// Pick the location state from the browser history state
		const { init, history } = ( browserHistory.location.state || {
			luckyNumber: 0,
			init: true,
			history: [],
		} ) as unknown as {
			luckyNumber: number;
			init: boolean;
			history: number[];
		};

		let newLuckyNumber = 0;

		/*
		 * Create a new lucky number only when the user clicks on the link.
		 */
		if ( ! init && browserHistory.action !== 'POP' ) {
			newLuckyNumber = ( ( Math.random() * 100 ) | 0 ) + 1;
		}

		// Crate the state to pass to the `<Link />` instance
		const state = {
			luckyNumber: newLuckyNumber,
			init: false,
			history: newLuckyNumber > 0 ? [ ...history, newLuckyNumber ] : history,
		};

		return (
			<VStack>
				<Link { ...args } options={ { state } } className="story-link" />

				{ ! init && (
					<div>
						<span>
							Previous lucky numbers: <strong>[ { history.join( ', ' ) } ]</strong>
						</span>
					</div>
				) }

				{ newLuckyNumber && (
					<div>
						Your lucky number is <strong>{ newLuckyNumber }</strong>
					</div>
				) }
			</VStack>
		);
	},
};
