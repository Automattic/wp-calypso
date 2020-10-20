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
import * as actions from 'calypso/state/jetpack/credentials/actions';

/**
 * Internal dependencies
 */
import withServerCredentialsForm from 'calypso/components/jetpack/with-server-credentials-form';

/**
 * Mocks
 */
jest.mock( 'components/data/query-site-credentials', () => {
	const QuerySiteCredentials = () => <div />;
	return QuerySiteCredentials;
} );

jest.mock( 'state/selectors/get-jetpack-credentials', () => ( {
	__esModule: true,
	default: () => ( {
		user: 'jetpackUser',
		host: 'jetpackHost',
		port: 33,
		abspath: '/jetpack/path',
	} ),
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
	/* eslint-disable no-import-assign */
	actions.updateCredentials = jest.fn( () => ( {
		type: 'update-credentials',
	} ) );
	// eslint-disable-line
	actions.deleteCredentials = jest.fn( () => ( {
		type: 'delete-credentials',
	} ) );
	/* eslint-enable no-import-assign */

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

	const store = createStore( () => {}, {} );
	const utils = render(
		<Provider store={ store }>
			<FormComponent role={ role } siteId={ siteId } siteUrl={ siteUrl } />
		</Provider>
	);

	return { utils };
}

describe( 'useWithServerCredentials HOC', () => {
	it( 'should not update credentials (should display error messages)', async () => {
		const { utils } = setup( {} );
		const submitButton = utils.getByText( 'Submit' );
		const errorMessagesContainer = utils.getByTestId( 'error-messages' );
		fireEvent.click( submitButton );
		expect( errorMessagesContainer.innerHTML ).toContain( 'Please enter your server password.' );
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
				path: '/jetpack/path',
				port: 33,
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

	it( 'should use state to prefill the form', async () => {
		const { utils } = setup();
		const submitButton = utils.getByText( 'Submit' );
		const errorMessagesContainer = utils.getByTestId( 'error-messages' );
		const formDataContainer = utils.getByTestId( 'form-content' );

		// Verify the form was pre-filled with the current store
		expect( formDataContainer.innerHTML ).toContain( 'jetpackUser' );
		expect( formDataContainer.innerHTML ).toContain( 'jetpackHost' );
		expect( formDataContainer.innerHTML ).toContain( 33 );
		expect( formDataContainer.innerHTML ).toContain( '/jetpack/path' );

		fireEvent.click( submitButton );
		expect( errorMessagesContainer.innerHTML ).not.toContain(
			'Please enter your server username.'
		);
		expect( errorMessagesContainer.innerHTML ).not.toContain(
			'Please enter a valid server address.'
		);
		expect( errorMessagesContainer.innerHTML ).toContain( 'Please enter your server password.' );
	} );
} );
