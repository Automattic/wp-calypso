/**
 * External dependencies
 */
import { isEmpty, replace } from 'lodash';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dnsTemplates } from 'lib/domains/constants';
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

		const { domain, translate } = this.props,
			variables = {
				token: this.state.token,
				domain,
				mxdata: replace( domain, '.', '-' ) + '.mail.protection.outlook.com.'
			};

		upgradesActions.applyDnsTemplate( domain, dnsTemplates.MICROSOFT_OFFICE365, variables, ( error ) => {
			if ( error ) {
				notices.error( error.message || translate( 'The DNS records have not been added.' ) );
			} else {
				notices.success( translate( 'All DNS records that Office 365 needs have been added.' ), {
					duration: 5000
				} );
			}

			this.setState( { submitting: false } );
		} );
	}

	render() {
		const isDataValid = this.state.token.match( /^MS=ms\d{4,20}$/ ),
			{ translate } = this.props;

		return (
			<form className="dns__office365">
				<div className="dns__form-content">
					<FormFieldset>
						<FormLabel>{ translate( 'Office 365 Verification Token - from the TXT record verification' ) }</FormLabel>
						<FormTextInput
							name="token"
							isError={ ! isEmpty( this.state.token ) && ! isDataValid }
							onChange={ this.onChange }
							placeholder="MS=ms..." />
						{ this.state.token && ! isDataValid &&
						<FormInputValidation text={ translate( 'Invalid Token' ) } isError={ true } /> }
					</FormFieldset>

					<FormFooter>
						<FormButton
							disabled={ ! isDataValid || this.state.submitting }
							onClick={ this.onAddDnsRecords }>
							{ translate( 'Set up Office 365' ) }
						</FormButton>
					</FormFooter>
				</div>
			</form>
		);
	}
}

export default localize( Office365 );
