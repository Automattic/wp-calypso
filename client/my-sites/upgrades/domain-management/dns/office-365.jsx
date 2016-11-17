/**
 * External dependencies
 */
import isEmpty from 'lodash/isEmpty';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';

class Office365 extends Component {
	constructor( props ) {
		super( props );
		this.state = { token: '', submitting: false };
	}

	onChange = ( event ) => {
		const { value } = event.target;
		this.setState( { token: value } );
	}

	onAddDnsRecords = ( event ) => {
		event.preventDefault();
		this.setState( { submitting: true } );
		upgradesActions.addDnsOffice( this.props.selectedDomainName, this.state.token, ( error ) => {
			if ( error ) {
				notices.error( error.message || this.props.translate( 'The DNS record has not been added.' ) );
				this.setState( { submitting: false } );
			} else {
				notices.success( this.props.translate( 'All DNS records that Office 365 needs have been added.' ), {
					duration: 5000
				} );
			}
		} );
	}

	render() {
		const isDataValid = this.state.token.match( /^MS=ms\d+$/ );

		return (
			<form className="dns__office365">
				<div className="dns__form-content">
					<FormFieldset>
						<FormLabel>{ this.props.translate( 'Office 365 Verification Token - from the TXT record verification' ) }</FormLabel>
						<FormTextInput
							name="token"
							isError={ ! isEmpty( this.state.token ) && ! isDataValid }
							onChange={ this.onChange }
							placeholder="MS=ms..." />
						{ this.state.token && ! isDataValid &&
							<FormInputValidation text={ this.props.translate( 'Invalid Token' ) } isError={ true } /> }
					</FormFieldset>

					<FormFooter>
						<FormButton
							disabled={ ! isDataValid || this.state.submitting }
							onClick={ this.onAddDnsRecords }>
							{ this.props.translate( 'Set up Office 365' ) }
						</FormButton>
					</FormFooter>
				</div>
			</form>
		);
	}
}

export default localize( Office365 );
