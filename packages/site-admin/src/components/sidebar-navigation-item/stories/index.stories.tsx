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
		const icon = allIcons?.[ iconKey ] || allIcons.capturePhoto;

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
	children: __( 'Site Photos Gallery', 'a8c-site-admin' ),
	onClick: fn(),
};

// Add a story for the suffix prop.
export const WithChevronSuffix: Story = {
	args: {
		children: __( 'More options', 'a8c-site-admin' ),
		suffix: 'CHEVRON',
	},
};
