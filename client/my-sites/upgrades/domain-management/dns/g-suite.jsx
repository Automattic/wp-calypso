/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
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

class GSuite extends Component {
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
				domain
			};

		upgradesActions.applyDnsTemplate( domain, dnsTemplates.G_SUITE, variables, ( error ) => {
			if ( error ) {
				notices.error( error.message || translate( 'The DNS records have not been added.' ) );
			} else {
				notices.success( translate( 'All DNS records that G Suite needs have been added.' ), {
					duration: 5000
				} );
			}

			this.setState( { submitting: false } );
		} );
	}

	render() {
		const isDataValid = this.state.token.match( /^google-site-verification=\w{43}$/ ),
			{ translate } = this.props;

		return (
			<form className="dns__template-form">
				<div className="dns__form-content">
					<FormFieldset>
						<FormLabel>{ translate( 'G Suite Verification Token - from the TXT record verification' ) }</FormLabel>
						<FormTextInput
							name="token"
							isError={ ! isEmpty( this.state.token ) && ! isDataValid }
							onChange={ this.onChange }
							placeholder="google-site-verification=..." />
						{ this.state.token && ! isDataValid &&
						<FormInputValidation text={ translate( 'Invalid Token' ) } isError={ true } /> }
					</FormFieldset>

					<FormFooter>
						<FormButton
							disabled={ ! isDataValid || this.state.submitting }
							onClick={ this.onAddDnsRecords }>
							{ translate( 'Set up G Suite' ) }
						</FormButton>
					</FormFooter>
				</div>
			</form>
		);
	}
}

export default localize( GSuite );
