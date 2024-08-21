/**
 * @jest-environment jsdom
 */
import { waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationCredentials from '..';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );

const siteId = 123456789;

( useSite as jest.Mock ).mockReturnValue( {
	ID: siteId,
	URL: 'https://site-url.wordpress.com',
} );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationCredentials { ...combinedProps } />, renderOptions );
};

describe( 'SiteMigrationCredentials', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'renders the form', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		expect( screen.queryByRole( 'button', { name: /Continue/ } ) ).toBeInTheDocument();
		expect( screen.queryByText( 'How can we access your site?' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Site address' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'WordPress admin username' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Password' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Notes (optional)' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Notes (optional)' ) ).toBeInTheDocument();
	} );

	it( 'does not show any error message by default', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		expect(
			screen.queryByText( 'Please enter your WordPress site address.' )
		).not.toBeInTheDocument();
		expect(
			screen.queryByText( 'Please enter your WordPress admin username.' )
		).not.toBeInTheDocument();
	} );

	it( 'clicking without any input renders default error messages', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await waitFor( async () => {
			await userEvent.click( screen.getByRole( 'button', { name: /Continue/ } ) );
		} );

		await waitFor( async () => {
			expect(
				screen.queryByText( 'Please enter your WordPress site address.' )
			).toBeInTheDocument();
			expect(
				screen.queryByText( 'Please enter your WordPress admin username.' )
			).toBeInTheDocument();
		} );
	} );
} );
