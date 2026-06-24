/**
 * @jest-environment jsdom
 */
import { rawUserPreferencesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AchievementsNotificationSettings from '../index';

const mockMutationFn = jest.fn().mockResolvedValue( {} );

jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	userPreferenceOptimisticMutation: () => ( { mutationFn: mockMutationFn } ),
} ) );

function setup( savedValue?: 'enabled' | 'disabled' ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { staleTime: Infinity, retry: false } },
	} );
	if ( savedValue !== undefined ) {
		queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
			'achievements-global-notifications': savedValue,
		} );
	}
	return {
		user: userEvent.setup(),
		...renderWithProvider( <AchievementsNotificationSettings />, { queryClient } ),
	};
}

describe( 'AchievementsNotificationSettings', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the toggle checked when notifications are enabled', () => {
		setup( 'enabled' );
		expect( screen.getByRole( 'checkbox', { name: 'Achievements' } ) ).toBeChecked();
	} );

	it( 'renders the toggle unchecked when notifications are disabled', () => {
		setup( 'disabled' );
		expect( screen.getByRole( 'checkbox', { name: 'Achievements' } ) ).not.toBeChecked();
	} );

	it( 'saves the disabled value when toggled off', async () => {
		const { user } = setup( 'enabled' );
		await user.click( screen.getByRole( 'checkbox', { name: 'Achievements' } ) );
		expect( mockMutationFn ).toHaveBeenCalledWith( 'disabled' );
		expect( screen.getByRole( 'checkbox', { name: 'Achievements' } ) ).not.toBeChecked();
	} );
} );
