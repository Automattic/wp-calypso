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
				<RouterProvider>
					<Story />
				</RouterProvider>
			);
		},
	],
};

export default meta;

type Story = StoryObj< typeof Link >;

/**
 * The Link component enables navigation between routes in the application,<br />
 * maintaining state and avoiding full page reloads.
 */
export const Default: Story = {
	args: {
		to: '/home',
		children: 'Homepage',
		className: 'story-link',
	},
};

type HistoryState = {
	luckyNumber: number;
	init: boolean;
	history: number[];
};

const INITIAL_HISTORY_STATE: HistoryState = {
	luckyNumber: 0,
	init: true,
	history: [],
};

/**
 * This story shows how to pass custom state to the Link component using the options prop.<br />
 * Each time the user clicks the link, a new _lucky number_ is generated and passed along.<br />
 * You can see how the state is preserved when navigating back and forth.
 */
export const PassCustomState: Story = {
	args: {
		to: '/home',
		children: 'Request lucky number!',
	},

	render: function Template( args ) {
		/*
		 * Force re-render on location changes to sync
		 * with browserHistory.location.state
		 */
		useLocation();

		// Pick the location state from the browser history state
		const { init, history } =
			( browserHistory.location.state as HistoryState ) || INITIAL_HISTORY_STATE;

		let newLuckyNumber = 0;

		// Create a new lucky number only when the init flag is false.
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
						Previous lucky numbers: <strong>[ { history.join( ', ' ) } ]</strong>
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
