/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileVisibilityCard from '../profile-visibility-card';

describe( 'ProfileVisibilityCard', () => {
	const onChange = jest.fn();
	const onChangeAchievements = jest.fn();

	function renderCard(
		props: Partial< React.ComponentProps< typeof ProfileVisibilityCard > > = {}
	) {
		return render(
			<ProfileVisibilityCard
				postsVisible
				sitesVisible
				achievementsVisible
				onChange={ onChange }
				onChangeAchievements={ onChangeAchievements }
				{ ...props }
			/>
		);
	}

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'reports the inverse via onChange when toggled off', async () => {
		renderCard( { postsVisible: false } );
		expect( screen.getByRole( 'checkbox', { name: 'Show Posts tab' } ) ).not.toBeChecked();

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'checkbox', { name: 'Show Posts tab' } ) );

		expect( onChange ).toHaveBeenCalledWith( 'posts', true );
		expect( onChangeAchievements ).not.toHaveBeenCalled();
	} );

	test( 'reports the inverse via onChange when toggled on', async () => {
		renderCard( { sitesVisible: false } );
		expect( screen.getByRole( 'checkbox', { name: 'Show Sites tab' } ) ).not.toBeChecked();

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'checkbox', { name: 'Show Sites tab' } ) );

		expect( onChange ).toHaveBeenCalledWith( 'sites', true );
		expect( onChangeAchievements ).not.toHaveBeenCalled();
	} );

	test( 'reports the raw checked value via onChangeAchievements', async () => {
		renderCard( { achievementsVisible: false } );
		expect( screen.getByRole( 'checkbox', { name: 'Show Achievements tab' } ) ).not.toBeChecked();

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'checkbox', { name: 'Show Achievements tab' } ) );

		expect( onChangeAchievements ).toHaveBeenCalledWith( true );
		expect( onChange ).not.toHaveBeenCalled();
	} );
} );
