/**
 * External dependencies
 */

import React from 'react';
import debugModule from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormTextInput from 'components/forms/form-text-input';
import FormStateStore from '../';
import createFormStore from '../store';

const { isFieldDisabled } = FormStateStore;

const debug = debugModule( 'calypso:lib:form-state:examples:sync-initialize' );

class SyncInitialize extends React.Component {
	UNSAFE_componentWillMount() {
		this.formStore = createFormStore( {
			syncInitialize: {
				fieldNames: [ 'firstName', 'lastName' ],
			},
		} );
		this.formStore.on( 'change', this.updateFormState.bind( this ) );
		this.updateFormState();
	}

	updateFormState() {
		this.setState( { form: this.formStore.get() } );
	}

	render() {
		return (
			<div>
				<form onSubmit={ this.handleSubmit.bind( this ) }>
					<FormTextInput
						name="firstName"
						placeholder={ i18n.translate( 'First Name' ) }
						onChange={ this.handleFieldChange.bind( this ) }
						disabled={ isFieldDisabled( this.state.form, 'firstName' ) }
					/>

					<FormTextInput
						name="lastName"
						placeholder={ i18n.translate( 'Last Name' ) }
						onChange={ this.handleFieldChange.bind( this ) }
						disabled={ isFieldDisabled( this.state.form, 'lastName' ) }
					/>

					<Button type="submit" primary>
						Submit
					</Button>
				</form>

				<pre>{ JSON.stringify( this.state, null, 2 ) }</pre>
			</div>
		);
	}

	handleFieldChange( event ) {
		event.preventDefault();

		this.formStore.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	}

	handleSubmit( event ) {
		event.preventDefault();
		debug( 'submit success' );
	}
}

export default SyncInitialize;
