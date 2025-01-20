/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationImportOrMigrate from '..';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps } from '../../test/helpers';

const render = ( props?: Partial< StepProps > ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationImportOrMigrate { ...combinedProps } /> );
};

jest.mock( 'calypso/data/site-profiler/use-hosting-provider-url-details' );
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/data/site-migration/use-migration-sticker' );

( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
	addMigrationSticker: jest.fn(),
	deleteMigrationSticker: jest.fn(),
} );

( useSite as jest.Mock ).mockReturnValue( {
	plan: { features: { active: [ 'install-plugins' ] } },
} );

( useHostingProviderUrlDetails as jest.Mock ).mockReturnValue( {
	data: {
		name: 'unknown',
		is_unknown: true,
		is_a8c: false,
	},
} );

describe( 'Site Migration Import or Migrate Step', () => {
	it( 'renders the migration options', () => {
		render();

		expect( screen.getByRole( 'heading', { name: /Migrate site/ } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: /Import content only/ } ) ).toBeVisible();
	} );

	it( 'starts the import flow when the user selects the "Import content only" option', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'heading', { name: /Import content only/ } ) );

		expect( submit ).toHaveBeenCalledWith( { destination: 'import' } );
	} );

	it( 'starts the migration only when the user selects the "Migrate site" option', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'heading', { name: /Migrate site/ } ) );

		expect( submit ).toHaveBeenCalledWith( { destination: 'migrate' } );
	} );

	it( 'starts the upgrade flow when the current site can NOT install plugins', async () => {
		( useSite as jest.Mock ).mockReturnValue( {
			plan: { features: { active: [] } },
		} );
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'heading', { name: /Migrate site/ } ) );

		expect( submit ).toHaveBeenCalledWith( { destination: 'upgrade' } );
	} );

	it( 'shows the host identification message when the host is known and not a8c', async () => {
		useHostingProviderUrlDetails.mockReturnValue( {
			data: {
				name: 'WP Engine',
				is_unknown: false,
				is_a8c: false,
			},
		} );

		const { container, queryByText } = render();

		expect( container.querySelectorAll( '.formatted-header__subtitle' ) ).toHaveLength( 1 );
		expect( queryByText( /WP Engine/ ) ).toBeInTheDocument();
	} );

	it( "doesn't show the host identification message when the host is a8c", async () => {
		useHostingProviderUrlDetails.mockReturnValue( {
			data: {
				name: 'WordPress.com',
				is_unknown: false,
				is_a8c: true,
			},
		} );

		const { container, queryByText } = render();

		expect( container.querySelectorAll( '.onboarding-subtitle' ) ).toHaveLength( 0 );
		expect( queryByText( /WordPress.com/ ) ).not.toBeInTheDocument();
	} );

	it( "doesn't show the host identification message when the host is unknown", async () => {
		useHostingProviderUrlDetails.mockReturnValue( {
			data: {
				name: 'unknown',
				is_unknown: true,
				is_a8c: false,
			},
		} );

		const { container, queryByText } = render();

		expect( container.querySelectorAll( '.onboarding-subtitle' ) ).toHaveLength( 0 );
		expect( queryByText( /unknown/ ) ).not.toBeInTheDocument();
	} );

	it( 'calls the deleteMigrationSticker function to delete migration sticker when import button is clicked', async () => {
		const deleteMigrationSticker = jest.fn();
		( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
			deleteMigrationSticker,
		} );

		( useSite as jest.Mock ).mockReturnValue( {
			ID: 123,
		} );

		render();

		await userEvent.click( screen.getByRole( 'heading', { name: /Import content only/ } ) );

		expect( deleteMigrationSticker ).toHaveBeenCalledWith( 123 );
	} );

	it( 'shows the upgrade required badge when the site can not install plugins', () => {
		render();

		expect( screen.getByText( /Requires Business plan/ ) ).toBeInTheDocument();
	} );

	it( 'shows the included with your plan badge when the site can install plugins', () => {
		( useSite as jest.Mock ).mockReturnValue( {
			plan: { features: { active: [ 'install-plugins' ] } },
		} );
		render();

		expect( screen.getByText( /Included with your plan/ ) ).toBeInTheDocument();
	} );
} );
