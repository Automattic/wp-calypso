/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import userSuggestions from 'calypso/state/user-suggestions/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import connectUserMentions from '../connect';

jest.mock( 'calypso/components/data/query-users-suggestions', () => () => (
	<p>Fetching suggestions</p>
) );

const Input = connectUserMentions( ( { suggestions, ...props } ) => (
	<input aria-label="Comment" { ...props } />
) );

describe( 'connectUserMentions', () => {
	it( 'fetches suggestions on the first focus, not on mount', async () => {
		const user = userEvent.setup();
		const onFocus = jest.fn();
		renderWithProvider( <Input siteId={ 1 } onFocus={ onFocus } />, {
			reducers: { userSuggestions },
		} );

		expect( screen.queryByText( 'Fetching suggestions' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'textbox', { name: 'Comment' } ) );

		expect( screen.getByText( 'Fetching suggestions' ) ).toBeVisible();
		expect( onFocus ).toHaveBeenCalled();
	} );
} );
