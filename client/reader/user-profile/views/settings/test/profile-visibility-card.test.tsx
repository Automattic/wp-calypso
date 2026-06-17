/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileVisibilityCard from '../profile-visibility-card';

describe( 'ProfileVisibilityCard', () => {
	test( 'reflects the current visibility and reports toggle changes', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render( <ProfileVisibilityCard postsVisible sitesVisible={ false } onChange={ onChange } /> );

		const postsToggle = screen.getByRole( 'checkbox', { name: 'Show Posts tab' } );
		const sitesToggle = screen.getByRole( 'checkbox', { name: 'Show Sites tab' } );
		expect( postsToggle ).toBeChecked();
		expect( sitesToggle ).not.toBeChecked();

		await user.click( postsToggle );
		expect( onChange ).toHaveBeenCalledWith( 'posts', false );

		await user.click( sitesToggle );
		expect( onChange ).toHaveBeenCalledWith( 'sites', true );
	} );
} );
