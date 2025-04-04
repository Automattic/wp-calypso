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

type IconName = keyof typeof allIcons;

const { Icon, ...allIcons } = allIconComponents;
const iconNames = Object.keys( allIcons ) as IconName[];

/**
 * Storybook metadata
 */
const meta: Meta< typeof SidebarNavigationItem > = {
	title: 'Components/SidebarNavigationItem',
	component: SidebarNavigationItem,
	tags: [ 'autodocs' ],
	argTypes: {
		icon: {
			control: 'select',
			options: [ ...iconNames, 'none' ],
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
	},
	render: function Template( args ) {
		const { icon: iconName, children, ...validArgs } = args;

		// Pick the icon component based on the icon name.
		const iconKey = iconName as unknown as IconName;
		const icon = allIcons?.[ iconKey ] || allIcons.capturePhoto;

		return (
			<SidebarNavigationItem { ...validArgs } icon={ icon }>
				{ __( 'Site Photos Gallery', 'a8c-site-admin' ) }
			</SidebarNavigationItem>
		);
	},
};

/**
 * This story demonstrates how the component renders a `<a>` element
 * when the `to` prop is provided
 */
export const WithToProp: Story = {
	args: {
		to: '/',
		children: __( 'Site Photos Gallery', 'a8c-site-admin' ),
	},
};

export const WithChevronSuffix: Story = {
	args: {
		children: __( 'More options', 'a8c-site-admin' ),
		suffix: 'CHEVRON',
	},
};
