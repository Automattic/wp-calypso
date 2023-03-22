import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserSettings } from '../src/components/UserSettings';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

describe( 'UserSettings', () => {
	it( 'render correctly', async () => {
		render( <UserSettings /> );

		expect( screen.getByLabelText( 'Email format' ) ).toBeVisible();
		expect( screen.getByText( 'Daily/weekly delivery window' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Your emails will be sent out at this day and time once you choose a daily or weekly delivery'
			)
		).toBeVisible();
		expect( screen.getByLabelText( 'Pause emails' ) ).toBeVisible();
		expect(
			screen.getByLabelText(
				'Pause all email updates from sites you’re following on WordPress.com'
			)
		).toBeVisible();
	} );

	it( 'changes the value of the checkbox on click', async () => {
		const onChange = jest.fn();
		render( <UserSettings onChange={ onChange } /> );

		const checkbox = screen.getByTestId( 'pause-checkbox' );
		expect( checkbox ).not.toBeChecked();

		checkbox.click();
		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( checkbox ).toBeChecked();
	} );
} );
