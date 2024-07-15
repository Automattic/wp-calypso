/**
 * @jest-environment jsdom
 */
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationInstructions from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import { SitePreview } from '../site-preview';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/data/site-migration/use-migration-sticker' );
jest.mock( 'calypso/data/site-profiler/use-hosting-provider-url-details' );
( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
	deleteMigrationSticker: jest.fn(),
} );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 123,
} );

// Mock the hooks and components
jest.mock( '../site-preview' );

jest.mock( 'calypso/lib/analytics/tracks', () => {
	return {
		recordTracksEvent: jest.fn(),
	};
} );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 123,
} );

const render = ( props?: Partial< StepProps > ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationInstructions { ...combinedProps } /> );
};

( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
	deleteMigrationSticker: jest.fn(),
} );

( SitePreview as jest.Mock ).mockImplementation( () => <div>SitePreview Component</div> );

describe( 'SiteMigrationInstructions', () => {
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
