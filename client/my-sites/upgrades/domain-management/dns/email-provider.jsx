/**
 * External dependencies
 */
import { isEmpty, trim } from 'lodash';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';

class EmailProvider extends Component {
	constructor( props ) {
		super( props );
		this.state = { token: '', submitting: false };
	}

	onChange = ( event ) => {
		const { value } = event.target;
		this.setState( { token: trim( value ) } );
	}

	onAddDnsRecords = ( event ) => {
		event.preventDefault();
		this.setState( { submitting: true } );

		const { domain, translate, template } = this.props;
		let variables = {
			token: this.state.token,
			domain
		};

		if ( template.modifyVariables ) {
			variables = template.modifyVariables( variables );
		}

		upgradesActions.applyDnsTemplate( domain, template.dnsTemplate, variables, ( error ) => {
			if ( error ) {
				notices.error( error.message || translate( 'We weren\'t able to add DNS records for this service. Please try again.' ) );
			} else {
				notices.success( translate( 'Hooray! We\'ve successfully added DNS records for this service.' ), {
					duration: 5000
				} );
			}

			this.setState( { submitting: false } );
		} );
	}

	render() {
		const { translate } = this.props,
			{ name, label, placeholder, validationPattern } = this.props.template,
			isDataValid = this.state.token.match( validationPattern );

		return (
			<form className="dns__template-form">
				<div className="dns__form-content">
					<FormFieldset>
						<FormLabel htmlFor="dns-template-token">{ label }</FormLabel>
						<FormTextInput
							id="dns-template-token"
							key={ `dns-templates-token-${ name }` }
							name="token"
							isError={ ! isEmpty( this.state.token ) && ! isDataValid }
							onChange={ this.onChange }
							placeholder={ placeholder } />
						{ this.state.token && ! isDataValid &&
						<FormInputValidation text={ translate( 'Invalid Token' ) } isError={ true } /> }
					</FormFieldset>

					<FormFooter>
						<FormButton
							disabled={ ! isDataValid || this.state.submitting }
							onClick={ this.onAddDnsRecords }>
							{ translate(
								'Set up %(providerName)s',
								{
									args: { providerName: name },
									comment: '%(providerName)s will be replaced with the name of the service ' +
										'provider that this template is used for, for example G Suite or Office 365'
								}
							) }
						</FormButton>
					</FormFooter>
				</div>
			</form>
		);
	}
}

export default localize( EmailProvider );
