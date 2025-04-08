/**
 * External dependencies
 */
import { fn } from '@storybook/test';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import * as allIconComponents from '@wordpress/icons';
/*
 * Internal dependencies
 */
import { SidebarNavigationItem, SidebarNavigationContext, createNavState } from '../../';
/**
 * Types
 */
import type { Meta, StoryObj } from '@storybook/react';

const { Icon, ...allIcons } = allIconComponents;

/**
 * Storybook metadata
 */
const meta: Meta< typeof SidebarNavigationItem > = {
	title: 'Components/SidebarNavigationItem',
	component: SidebarNavigationItem,
	tags: [ 'autodocs' ],
	argTypes: {
		icon: {
			control: {
				type: 'select',
				labels: {
					'': 'No icon',
				},
			},
			options: [ '', ...Object.keys( allIcons ) ],
			mapping: {
				'': undefined,
				...Object.entries( allIcons ).reduce(
					( acc, [ name, icon ] ) => ( {
						...acc,
						[ name ]: icon,
					} ),
					{}
				),
			},
		},
		size: {
			control: 'select',
			options: [ 'small', 'medium', 'large' ],
		},
	},
	decorators: [
		function WithNavigationContext( Story ) {
			const [ navState ] = useState( createNavState() );

			return (
				<SidebarNavigationContext.Provider value={ navState }>
					<Story />
				</SidebarNavigationContext.Provider>
			);
		},
	],
};

export default meta;

type Story = StoryObj< typeof SidebarNavigationItem >;

/**
 * This story demonstrates how the component renders a `<button>` element
 * when the `onClick` prop is provided.
 */
export const WithOnClickHandler: Story = {
	args: {
		onClick: fn(),
		children: __( 'Site Photos Gallery', 'a8c-site-admin' ),
		icon: allIcons.capturePhoto,
	},
};

/**
 * This story demonstrates how the component renders a `<a>` element
 * when the `to` prop is provided
 */
export const WithToProp: Story = {
	args: {
		to: '/home',
		children: __( 'Home', 'a8c-site-admin' ),
		icon: allIcons.home,
	},
};

export const WithChevronSuffix: Story = {
	args: {
		children: __( 'More options', 'a8c-site-admin' ),
		suffix: 'CHEVRON',
	},
};
