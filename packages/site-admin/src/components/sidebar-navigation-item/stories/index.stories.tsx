/**
 * External dependencies
 */
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
	argTypes: {
		icon: {
			control: 'select',
			options: [ ...iconNames, 'none' ],
		},
		as: {
			control: 'select',
			options: [ 'button', 'a' ],
		},
	},
};

export default meta;

type Story = StoryObj< typeof SidebarNavigationItem >;

export const Default: Story = {
	render: function Template( args ) {
		const { icon: iconName, children, ...validArgs } = args;

		// Pick the icon component based on the icon name.
		const iconKey = iconName as unknown as IconName;
		const icon = allIcons?.[ iconKey ];

		const [ navState ] = useState( createNavState() );
		return (
			<SidebarNavigationContext.Provider value={ navState }>
				<SidebarNavigationItem { ...validArgs } icon={ icon }>
					{ children }
				</SidebarNavigationItem>
			</SidebarNavigationContext.Provider>
		);
	},
};

Default.storyName = 'SidebarNavigationItem';
Default.args = {
	withChevron: true,
	children: __( 'Delete item' ),
	icon: undefined,
	as: 'button',
	to: 'https://example.com',
	className: '',
	uid: 'item-1',
};
