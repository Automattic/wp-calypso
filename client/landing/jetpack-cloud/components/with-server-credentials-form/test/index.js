/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render, fireEvent } from '@testing-library/react';
import * as actions from 'state/jetpack/credentials/actions';

/**
 * Internal dependencies
 */
import withServerCredentialsForm from 'landing/jetpack-cloud/components/with-server-credentials-form';

/**
 * Mocks
 */
jest.doMock( 'components/data/query-rewind-state', () => {
	const QueryRewindState = () => <div />;
	return QueryRewindState;
} );

const mockCredentials = {
	credentials: [
		{
			role: 'main',
			user: 'someUser',
			host: 'someHost',
			port: 33,
			path: 'somePath',
		},
	],
};

jest.mock( 'state/selectors/get-rewind-state', () => ( {
	__esModule: true,
	default: () => mockCredentials,
} ) );

jest.mock( 'state/sites/selectors', () => ( {
	getSiteSlug: () => 'site-slug',
} ) );

jest.mock( 'state/selectors/get-jetpack-credentials-update-status', () => () => 'unsubmitted' );

/**
 * Helper functions
 */

function renderInput( name, onChange, values, type = 'text' ) {
	return (
		<input
			type={ type }
			name={ name }
			value={ values[ name ] }
			data-testid={ name }
			onChange={ onChange }
		/>
	);
}

function setup( { role = 'main', siteId = 9999, siteUrl = 'siteUrl' } = {} ) {
	// Mutate action creators to make assertions on them
	actions.updateCredentials = jest.fn( () => ( {
		type: 'update-credentials',
	} ) );
	actions.deleteCredentials = jest.fn( () => ( {
		type: 'delete-credentials',
	} ) );

	// We create a simple form to test the utilities and data provided by
	// the withServerCredentials HOC.
	const WrappedForm = ( {
		form,
		formErrors,
		handleFieldChange,
		handleDelete,
		handleSubmit,
		toggleAdvancedSettings,
		showAdvancedSettings,
	} ) => {
		return (
			<form>
				{ renderInput( 'user', handleFieldChange, form ) }
				{ renderInput( 'pass', handleFieldChange, form, 'password' ) }
				{ renderInput( 'host', handleFieldChange, form ) }

				<div data-testid="error-messages">
					{ Object.values( formErrors )
						.filter( ( v ) => v )
						.join( ' ' ) }
				</div>

				<div data-testid="form-content">
					{ Object.values( form )
						.filter( ( v ) => v )
						.join( ' ' ) }
				</div>

				<div data-testid="advanced-section">{ showAdvancedSettings && 'Hidden content!' }</div>

				<button type="button" onClick={ toggleAdvancedSettings }>
					Advanced Section
				</button>

				<button type="button" onClick={ handleDelete }>
					Delete
				</button>

				<button type="button" onClick={ handleSubmit }>
					Submit
				</button>
			</form>
		);
	};

	const FormComponent = withServerCredentialsForm( WrappedForm );

	// We use this function to rerender the component so we can make assertions when
	// props changes.
	const store = createStore( () => {}, {} );
	const FormComponentWithStore = ( otherProps = {} ) => (
		<Provider store={ store }>
			<FormComponent role={ role } siteId={ siteId } siteUrl={ siteUrl } { ...otherProps } />
		</Provider>
	);
	const utils = render( FormComponentWithStore() );

	return { utils, FormComponentWithStore };
}

describe( 'useWithServerCredentials HOC', () => {
	it( 'should not update credentials (should display error messages)', async () => {
		const { utils } = setup();
		const submitButton = utils.getByText( 'Submit' );
		const errorMessagesContainer = utils.getByTestId( 'error-messages' );
		fireEvent.click( submitButton );
		expect( errorMessagesContainer.innerHTML ).toContain( 'Please enter your server username.' );
		expect( errorMessagesContainer.innerHTML ).toContain( 'Please enter your server password.' );
		expect( errorMessagesContainer.innerHTML ).toContain( 'Please enter a valid server address.' );
		expect( actions.updateCredentials ).not.toBeCalled();
	} );

	it( 'should update credentials (should not display error messages)', async () => {
		const { utils } = setup();
		const submitButton = utils.getByText( 'Submit' );
		const errorMessagesContainer = utils.getByTestId( 'error-messages' );
		[ 'user', 'pass', 'host' ].forEach( ( inputName ) => {
			const input = utils.getByTestId( inputName );
			fireEvent.change( input, { target: { value: inputName } } );
			expect( input.value ).toBe( inputName );
		} );
		fireEvent.click( submitButton );
		expect( errorMessagesContainer.innerHTML ).toBe( '' );
		expect( actions.updateCredentials ).toHaveBeenCalledTimes( 1 );
		expect( actions.updateCredentials ).toBeCalledWith(
			9999,
			expect.objectContaining( {
				role: 'main',
				site_url: 'siteUrl',
				user: 'user',
				pass: 'pass',
				host: 'host',
				kpri: '',
				path: '',
				port: 22,
				protocol: 'ssh',
			} )
		);
	} );

	it( 'should delete credentials', async () => {
		const { utils } = setup();
		const deleteButton = utils.getByText( 'Delete' );
		fireEvent.click( deleteButton );
		expect( actions.deleteCredentials ).toHaveBeenCalledTimes( 1 );
		expect( actions.deleteCredentials ).toBeCalledWith( 9999, 'main' );
	} );

	it( 'should toggle the advanced section', async () => {
		const { utils } = setup();
		const advancedSection = utils.getByTestId( 'advanced-section' );
		expect( advancedSection.innerHTML ).toContain( '' );

		const toggleButton = utils.getByText( 'Advanced Section' );
		fireEvent.click( toggleButton );
		expect( advancedSection.innerHTML ).toContain( 'Hidden content!' );
	} );

	it( 'should use rewindState to prefill the form', async () => {
		const { utils, FormComponentWithStore } = setup();
		const submitButton = utils.getByText( 'Submit' );
		const errorMessagesContainer = utils.getByTestId( 'error-messages' );
		const formDataContainer = utils.getByTestId( 'form-content' );

		// Simulate updating props with a rewindState
		utils.rerender(
			FormComponentWithStore( {
				rewindState: mockCredentials,
			} )
		);
		fireEvent.click( submitButton );
		expect( errorMessagesContainer.innerHTML ).not.toContain(
			'Please enter your server username.'
		);
		expect( errorMessagesContainer.innerHTML ).not.toContain(
			'Please enter a valid server address.'
		);
		expect( formDataContainer.innerHTML ).toContain( 'someUser' );
		expect( formDataContainer.innerHTML ).toContain( 'someHost' );
		expect( formDataContainer.innerHTML ).toContain( 33 );
		expect( formDataContainer.innerHTML ).toContain( 'somePath' );
	} );
} );
