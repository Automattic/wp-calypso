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
	decorators: [
		function WithRouterProvider( Story ) {
			return (
				<RouterProvider routes={ [] }>
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
	},
};

export const PassCustomState: Story = {
	args: {
		to: '/home',
		children: 'Request lucky number!',
	},

	render: function Template( args ) {
		useLocation();

		// Pick the location state from the browser history singleton
		const { luckyNumber, clicked } = ( browserHistory.location.state || {
			luckyNumber: 0,
			clicked: false,
		} ) as unknown as {
			luckyNumber: number;
			clicked: boolean;
		};

		// The new lucky number is initially zero
		let newLuckyNumber: number = 0;

		/*
		 * Create a new lucky number only when the user clicks on the link.
		 * `clicked` is useful to detect if the user has clicked
		 * on the `<Link />` instance.
		 * It's defined into its options state object
		 */
		if ( clicked ) {
			newLuckyNumber = ( ( Math.random() * 100 ) | 0 ) + 1;
		}

		// Crate the state to pass to the `<Link />` instance
		const state = { luckyNumber: newLuckyNumber, clicked: true };

		return (
			<VStack>
				<Link { ...args } options={ { state } } />

				{ newLuckyNumber && (
					<div>
						Your lucky number is <strong>{ newLuckyNumber }.</strong>
					</div>
				) }

				{ luckyNumber && (
					<div>
						Your previous lucky number was <strong>{ luckyNumber }.</strong>
					</div>
				) }
			</VStack>
		);
	},
};
