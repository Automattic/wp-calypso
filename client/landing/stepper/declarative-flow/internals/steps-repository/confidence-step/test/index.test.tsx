/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ConfidenceStep from '..';
import { mockStepProps } from '../../test/helpers';

const render = ( props = {} ) => {
	const submit = vi.fn();
	const goBack = vi.fn();
	renderWithProvider(
		<MemoryRouter>
			<ConfidenceStep
				{ ...mockStepProps( { navigation: { submit, goBack }, stepName: 'confidence-step' } ) }
				from="source.example.com"
				{ ...props }
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

	it( 'names the source’s platform and the new site', () => {
		render( { platform: 'wix' } );

		expect( screen.getByText( 'On Wix today' ) ).toBeVisible();
		expect( screen.getByText( 'A new site' ) ).toBeVisible();
		expect( screen.getByText( 'On WordPress.com' ) ).toBeVisible();
		expect( screen.queryByText( 'From' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the copy it’s given', () => {
		render( {
			title: 'Ready to copy',
			subTitle: 'Your site runs on Wix. We’ll copy it to WordPress.com.',
			includesLabel: 'Why move to WordPress.com',
			includes: [ 'Your site is yours, on the open web', 'All of your images and files' ],
		} );

		expect( screen.getByRole( 'heading', { name: 'Ready to copy' } ) ).toBeVisible();
		expect(
			screen.getByText( 'Your site runs on Wix. We’ll copy it to WordPress.com.' )
		).toBeVisible();
		expect( screen.getByText( 'Why move to WordPress.com' ) ).toBeVisible();
		expect( screen.getAllByRole( 'listitem' ).map( ( item ) => item.textContent ) ).toEqual( [
			'Your site is yours, on the open web',
			'All of your images and files',
		] );
		expect( screen.queryByText( 'What we’ll copy over' ) ).not.toBeInTheDocument();
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
