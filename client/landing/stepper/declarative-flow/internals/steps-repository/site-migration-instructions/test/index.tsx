/**
 * @jest-environment jsdom
 */
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { usePrepareSiteForMigration } from 'calypso/landing/stepper/hooks/use-prepare-site-for-migration';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import SiteMigrationInstructions from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import { SitePreview } from '../site-preview';

jest.mock( 'calypso/landing/stepper/hooks/use-prepare-site-for-migration' );
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/landing/stepper/hooks/use-query' );
jest.mock( 'calypso/data/site-migration/use-migration-sticker' );
jest.mock( 'calypso/data/site-profiler/use-hosting-provider-url-details' );

( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
	deleteMigrationSticker: jest.fn(),
} );

// Mock the hooks and components
jest.mock( '../site-preview' );
jest.mock( 'calypso/lib/analytics/tracks' );

const mockGetQuery = ( from ) => {
	( useQuery as jest.Mock ).mockReturnValue( {
		get: () => {
			return from;
		},
	} );
};

const render = ( props?: Partial< StepProps > ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationInstructions { ...combinedProps } /> );
};

describe( 'SiteMigrationInstructions', () => {
	beforeAll( () => {
		( useHostingProviderUrlDetails as jest.Mock ).mockReturnValue( {
			data: {
				name: 'Unknown',
				is_unknown: true,
				is_a8c: false,
			},
		} );

		( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
			deleteMigrationSticker: jest.fn(),
		} );

		( usePrepareSiteForMigration as jest.Mock ).mockReturnValue( {
			detailedStatus: {},
			completed: false,
			migrationKey: 'migration-key-here',
			error: null,
		} );

		( SitePreview as jest.Mock ).mockImplementation( () => <div>SitePreview Component</div> );

		( useSite as jest.Mock ).mockReturnValue( {
			ID: 123,
		} );

		( recordTracksEvent as jest.Mock ).mockImplementation( () => {} );
	} );

	beforeEach( () => {
		mockGetQuery( 'http://example.com/' );
	} );

	it( 'should render preview column', async () => {
		const { container } = render();

		expect( container.querySelector( '.launchpad-container__main-content' ) ).toBeInTheDocument();
	} );

	it( 'should not render preview column if from is not informed', async () => {
		mockGetQuery( null );

		const { container } = render();

		expect(
			container.querySelector( '.launchpad-container__main-content' )
		).not.toBeInTheDocument();
	} );

	it.each( [
		{ hostingName: 'WP Engine', isUnknown: false, isA8c: false, expected: true },
		{ hostingName: 'WordPress.com', isUnknown: false, isA8c: true, expected: false },
		{ hostingName: 'Unknown', isUnknown: true, isA8c: false, expected: false },
	] )(
		'renders the hosting badge only when the hosting is known and not A8C',
		async ( { hostingName, isUnknown, isA8c, expected } ) => {
			( useHostingProviderUrlDetails as jest.Mock ).mockReturnValue( {
				data: {
					name: hostingName,
					is_unknown: isUnknown,
					is_a8c: isA8c,
				},
			} );

			const { queryByText } = render();

			const maybeExpect = ( arg, exp ) => ( exp ? expect( arg ) : expect( arg ).not );
			maybeExpect( queryByText( `Hosted with ${ hostingName }` ), expected ).toBeInTheDocument();
		}
	);

	it( 'calls deleteMigrationSticker on mount', () => {
		const { deleteMigrationSticker } = useMigrationStickerMutation();

		render();

		expect( deleteMigrationSticker ).toHaveBeenCalledWith( 123 );
	} );

	it( 'should render the steps progress', () => {
		const { container } = render();

		expect( container.querySelector( '.circular__progress-bar-text' )?.innerHTML ).toEqual( '0/3' );
	} );

	it( 'should update the progress when completing steps', async () => {
		const { container, getByRole } = render();

		await userEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect( container.querySelector( '.circular__progress-bar-text' )?.innerHTML ).toEqual( '1/3' );
	} );

	it( 'should navigate to the next step when clicking on Next', async () => {
		const { queryByText, getByRole } = render();

		await userEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect(
			queryByText( 'Then, pick WordPress.com as your destination host.' )
		).toBeInTheDocument();
	} );

	it( 'should be able to navigate back to the first step when it was completed', async () => {
		const { queryByText, getByRole } = render();

		await userEvent.click( getByRole( 'button', { name: /Next/ } ) );
		await userEvent.click( getByRole( 'button', { name: /Install the Migrate Guru plugin/ } ) );

		expect( queryByText( 'Migrate Guru plugin' ) ).toBeInTheDocument();
	} );

	it( 'should navigate to the next step when the steps are completed', async () => {
		const submit = jest.fn();
		const { getByRole } = render( { navigation: { submit } } );

		await userEvent.click( getByRole( 'button', { name: /Next/ } ) );
		await userEvent.click( getByRole( 'button', { name: /Next/ } ) );
		await userEvent.click( getByRole( 'button', { name: /Done/ } ) );

		expect( submit ).toHaveBeenCalledWith( { destination: 'migration-started' } );
	} );
} );
