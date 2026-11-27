/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ConfidenceStep from '..';
import { mockStepProps } from '../../test/helpers';

const render = () => {
	const submit = jest.fn();
	const goBack = jest.fn();
	renderWithProvider(
		<MemoryRouter>
			<ConfidenceStep
				{ ...mockStepProps( { navigation: { submit, goBack }, stepName: 'confidence-step' } ) }
				from="source.example.com"
			/>
		</MemoryRouter>,
		{ reducers: { documentHead: documentHeadReducer, ui: uiReducer } }
	);
	return { submit, goBack };
};

describe( 'ConfidenceStep', () => {
	it( 'shows the source going to a new site, with what we’ll copy', () => {
		render();

		expect( screen.getByRole( 'heading', { name: 'We can copy your whole site' } ) ).toBeVisible();
		expect( screen.getByText( 'A new WordPress.com site' ) ).toBeVisible();
		expect( screen.getByText( 'What we’ll copy over' ) ).toBeVisible();
	} );

	it( 'continues', async () => {
		const { submit } = render();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( submit ).toHaveBeenCalledWith( { action: 'continue' } );
	} );

	it( 'goes back to change the source', async () => {
		const { goBack } = render();

		await userEvent.click( screen.getByRole( 'button', { name: 'Change the site to copy' } ) );

		expect( goBack ).toHaveBeenCalled();
	} );
} );
