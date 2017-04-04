/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';
import { enterBusinessName, enterBusinessDescription } from 'state/pandance/actions';

export const BusinessInfo  = props => <div>
	<FormFieldset>
		<FormLabel>What is the name of your business?</FormLabel>
		<FormTextInput value={ props.business.name }
					   onChange={ event => props.enterBusinessName( event.target.value ) } />
	</FormFieldset>
	<FormFieldset>
		<FormLabel>In a few words, describe your business?</FormLabel>
		<FormTextInput placeholder="ex. Traditional pizzeria in New York"
					   value={ props.business.description }
					   onChange={ event => props.enterBusinessDescription( event.target.value ) } />
	</FormFieldset>

	<Button primary={ true } onClick={ () => page( '/pandance/blocks' ) }>Create Site</Button>
</div>;

export default connect( ( state, props ) => ( {
	business: state.pandance.business,
} ), dispatch => bindActionCreators( { enterBusinessName, enterBusinessDescription }, dispatch ) )( BusinessInfo );
