/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { SiteHub } from '../../';
import { RouterProvider } from '../../../router';
/**
 * Types
 */
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Storybook metadata
 */
const meta: Meta< typeof SiteHub > = {
	title: 'Components/SiteHub',
	component: SiteHub,
};

export default meta;

type Story = StoryObj< typeof SiteHub >;

export const Default: Story = {
	render: function Template() {
		return (
			<RouterProvider routes={ [] } pathArg="page">
				<SiteHub
					isTransparent
					navigationBackLabel={ __( 'Go to the Dashboard', 'a8c-site-admin' ) }
					navigationBackLink="/"
				/>
			</RouterProvider>
		);
	},
};
