/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProvisionStatus } from '..';

describe( 'ProvisionStatus', () => {
	it( 'renders "in progress" status', () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'pending',
			migrationKey: 'error',
		};

		render( <ProvisionStatus status={ status } /> );

		expect( screen.getByText( 'Installing the required plugins' ) ).toBeVisible();
	} );

	it( 'shows the number of in-progress steps', () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'pending',
			migrationKey: 'error',
		};

		render( <ProvisionStatus status={ status } /> );

		expect( screen.getByText( '2/3' ) ).toBeVisible();
	} );

	it( 'should render success message when all actions are successul', () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'success',
			migrationKey: 'success',
		};

		render( <ProvisionStatus status={ status } /> );

		expect(
			screen.getByText(
				/Your new site is ready! Enter your migration key into your old site to start your migration./
			)
		).toBeVisible();
	} );

	it( "shows instructions to the user get the key by itself when we can't get the key", () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'success',
			migrationKey: 'error',
		};

		render( <ProvisionStatus status={ status } /> );

		expect(
			screen.getByText(
				/Your new site is ready! Retrieve your migration key and enter it into your old site to start your migration./
			)
		).toBeVisible();
	} );

	it( 'should render error message when one of ther first two action fails', () => {
		const status = {
			siteTransfer: 'success',
			pluginInstallation: 'error',
			migrationKey: 'idle',
		};

		render( <ProvisionStatus status={ status } /> );

		expect(
			screen.getAllByText(
				( content, element ) =>
					!! element?.textContent?.match(
						/Sorry, we couldn’t finish setting up your site. Please contact support/
					)
			)[ 0 ]
		).toBeVisible();
	} );
} );
