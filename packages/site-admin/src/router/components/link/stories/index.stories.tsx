/**
 * External dependencies
 */
import { fn } from '@storybook/test';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useState } from '@wordpress/element';
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
 * The Link component enables navigation between routes in the application,
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
	/**
	 * The current lucky number.
	 */
	luckyNumber?: number;

	/**
	 * The previous lucky numbers from the history state.
	 */
	prevLuckyNumbers: number[];
};

const INITIAL_HISTORY_STATE: HistoryState = {
	luckyNumber: undefined,
	prevLuckyNumbers: [],
};

/**
 * This story shows how to pass custom state to the Link component using the options prop.
 * Each time the user clicks the link, a new _lucky number_ is generated and passed along.
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

		const [ newLuckyNumber, setNewLuckyNumber ] = useState< number | undefined >();

		/*
		 * Pick the previous lucky numbers from the history state
		 * or initialize the state if it's the first render
		 */
		const { prevLuckyNumbers } =
			( browserHistory.location.state as HistoryState ) || INITIAL_HISTORY_STATE;

		// Create the state object to pass to the `<Link />` instance
		const state = {
			luckyNumber: newLuckyNumber,
			prevLuckyNumbers: newLuckyNumber ? [ ...prevLuckyNumbers, newLuckyNumber ] : prevLuckyNumbers,
		};

		return (
			<VStack>
				<Link
					{ ...args }
					options={ { state } }
					className="story-link"
					onClick={ () => setNewLuckyNumber( ( ( Math.random() * 10 ) | 0 ) + 1 ) }
				/>

				{ prevLuckyNumbers.length && (
					<div>
						Previous lucky numbers: <strong>[ { prevLuckyNumbers.join( ', ' ) } ]</strong>
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

/**
 * This story shows how to pass a custom onClick handler to the Link component.
 */
export const WithCustomOnClick: Story = {
	args: {
		to: '/home',
		className: 'story-link',
		children: 'Click to call the onClick()!',
		onClick: fn(),
	},
};
