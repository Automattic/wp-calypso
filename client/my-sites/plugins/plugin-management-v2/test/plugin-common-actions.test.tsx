/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PluginCommonActions from '../plugin-common/plugin-common-actions';
import { plugin } from './utils/constants';

const props = {
	item: plugin,
	renderActions: () => <div>Actions</div>,
};

describe( '<PluginCommonActions>', () => {
	test( 'should render correctly and show the actions rendered', async () => {
		render( <PluginCommonActions { ...props } /> );
		const actionButton = screen.getByRole( 'button' );
		await userEvent.click( actionButton );
		expect( screen.getByText( 'Actions' ) ).toBeInTheDocument();
	} );
} );
