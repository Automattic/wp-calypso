/**
 * External dependencies
 */
import { action } from '@storybook/addon-actions';
import { useEffect, useRef } from '@wordpress/element';
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
					exitLabel={ __( 'Go to the Dashboard', 'a8c-site-admin' ) }
					exitLink="/"
				/>
			</RouterProvider>
		);
	},
};

export const FocusButtonOnMount: Story = {
	render: function Template() {
		const buttonRef = useRef< HTMLButtonElement >( null );

		useEffect( () => {
			buttonRef.current?.focus();
			action( 'Focus button' )( 'Focus on button' );
		}, [] );

		return (
			<RouterProvider routes={ [] } pathArg="page">
				<SiteHub
					isTransparent
					exitLabel={ __( 'Go to the Dashboard', 'a8c-site-admin' ) }
					exitLink="/"
					ref={ buttonRef }
				/>
			</RouterProvider>
		);
	},
};
