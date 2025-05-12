/**
 * External dependencies
 */
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { Page } from '../';
/**
 * Types
 */
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Page > = {
	title: 'Components/Page',
	component: Page,
};

export default meta;

type Story = StoryObj< typeof Page >;

export const Default: Story = {
	args: {
		title: __( 'Blog posts', 'site-admin' ),
		subTitle: __( 'Manage your blog posts', 'site-admin' ),
		actions: (
			<HStack>
				<Button variant="primary">{ __( 'New post', 'site-admin' ) }</Button>,
				<Button icon={ settings } />
			</HStack>
		),
		children: (
			<div>
				<h2>{ __( 'Blog posts content', 'site-admin' ) }</h2>
				<p>{ __( 'This is the content of the blog posts page.', 'site-admin' ) }</p>
			</div>
		),
	},
};
