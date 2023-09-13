/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import NotificationSettingsFormFooter from '../footer';

describe( 'NotificationSettingsFormFooter', () => {
	const defaultProps = {
		isLoading: false,
		validationError: '',
		isBulkUpdate: false,
		handleOnClose: jest.fn(),
		hasUnsavedChanges: false,
		unsavedChangesExist: true,
	};

	it( 'renders the component with Cancel and Save buttons', () => {
		render( <NotificationSettingsFormFooter { ...defaultProps } /> );

		expect(
			screen.getByRole( 'button', {
				name: 'Cancel and close notification settings popup',
			} )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: 'Save notification settings' } )
		).toBeInTheDocument();
	} );

	it( 'handles button clicks', () => {
		render( <NotificationSettingsFormFooter { ...defaultProps } /> );

		fireEvent.click(
			screen.getByRole( 'button', {
				name: 'Cancel and close notification settings popup',
			} )
		);
		expect( defaultProps.handleOnClose ).toHaveBeenCalled();

		const saveButton = screen.getByRole( 'button', { name: 'Save notification settings' } );
		fireEvent.click( saveButton );
		expect( saveButton ).toHaveTextContent( 'Save' );
	} );

	it( 'render component with save button disabled when it is loading', () => {
		const propsWithDisabledSave = {
			...defaultProps,
			isLoading: true,
		};
		render( <NotificationSettingsFormFooter { ...propsWithDisabledSave } /> );

		const saveButton = screen.getByRole( 'button', { name: 'Save notification settings' } );
		expect( saveButton ).toBeDisabled();
		expect( saveButton ).toHaveTextContent( 'Saving Changes' );
	} );

	it( 'render component with save button disabled when there are no unsaved changes', () => {
		const propsWithDisabledSave = {
			...defaultProps,
			unsavedChangesExist: false,
		};
		render( <NotificationSettingsFormFooter { ...propsWithDisabledSave } /> );

		const saveButton = screen.getByRole( 'button', { name: 'Save notification settings' } );
		expect( saveButton ).toBeDisabled();
		expect( saveButton ).toHaveTextContent( 'Save' );
	} );

	it( 'render component with error message when there are unsaved changes', () => {
		const propsWithDisabledSave = {
			...defaultProps,
			hasUnsavedChanges: true,
		};
		render( <NotificationSettingsFormFooter { ...propsWithDisabledSave } /> );

		expect(
			screen.getByText( 'You have unsaved changes. Are you sure you want to close?' )
		).toBeInTheDocument();
	} );

	it( 'render component with save button disabled and show error there is an error', () => {
		const validationError = 'Validation error message';
		const propsWithDisabledSave = {
			...defaultProps,
			validationError,
		};
		render( <NotificationSettingsFormFooter { ...propsWithDisabledSave } /> );

		const saveButton = screen.getByRole( 'button', { name: 'Save notification settings' } );
		expect( saveButton ).toBeDisabled();
		expect( saveButton ).toHaveTextContent( 'Save' );
		expect( screen.getByText( validationError ) ).toBeInTheDocument();
	} );
} );
