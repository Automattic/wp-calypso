import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BlockEmailsSetting } from '../src/components/fields/BlockEmailsSetting';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

describe( 'BlockEmailsSettings', () => {
	it( 'render correctly', async () => {
		render( <BlockEmailsSetting onChange={ () => null } /> );

		expect( screen.getByLabelText( 'Pause emails' ) ).toBeVisible();
		expect(
			screen.getByLabelText(
				'Pause all email updates from sites you’re following on WordPress.com'
			)
		).toBeVisible();
	} );

	it( 'changes the value of the checkbox on click', async () => {
		const onChange = jest.fn();
		render( <BlockEmailsSetting onChange={ onChange } /> );

		const checkbox = screen.getByTestId( 'pause-checkbox' );
		expect( checkbox ).not.toBeChecked();

		checkbox.click();
		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( checkbox ).toBeChecked();
	} );
} );
