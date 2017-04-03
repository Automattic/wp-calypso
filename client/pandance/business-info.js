/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';

export default props => <div>
	<FormFieldset>
		<FormLabel>Name</FormLabel>
		<FormTextInput placeholder="Manuel Pizza"></FormTextInput>
	</FormFieldset>
	<FormFieldset>
		<FormLabel>Business description</FormLabel>
		<FormTextInput placeholder="The best pizzaria in town"></FormTextInput>
	</FormFieldset>

	<Button primary={ true } onClick={ () => page( '/pandance/blocks' ) }>Next</Button>
</div>;
