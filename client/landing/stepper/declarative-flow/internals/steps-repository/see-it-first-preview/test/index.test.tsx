/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SeeItFirstPreview from '..';
import { mockStepProps } from '../../test/helpers';

const render = ( query: string ) => {
	const submit = jest.fn();
	renderWithProvider(
		<MemoryRouter basename="/setup" initialEntries={ [ `/setup/see-it-first-preview?${ query }` ] }>
			<SeeItFirstPreview
				{ ...mockStepProps( { navigation: { submit }, stepName: 'see-it-first-preview' } ) }
			/>
		</MemoryRouter>,
		{ reducers: { documentHead: documentHeadReducer, ui: uiReducer } }
	);
	return submit;
};

describe( 'SeeItFirstPreview', () => {
	it( 'pitches the move next to a screenshot of the source, without creating anything', async () => {
		const submit = render( 'from=busybearscleaning.com&platform=wix' );

		expect( screen.getByRole( 'heading', { name: 'Your site, on WordPress.com' } ) ).toBeVisible();
		expect( screen.getByText( /This is busybearscleaning\.com as it looks today/ ) ).toBeVisible();
		expect(
			document.querySelector( '.see-it-first-preview__screenshot .site-thumbnail' )
		).toBeInTheDocument();
		expect( submit ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'keep' } );
	} );

	it( 'asks for an address when there is none', async () => {
		const submit = render( '' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
	} );
} );
