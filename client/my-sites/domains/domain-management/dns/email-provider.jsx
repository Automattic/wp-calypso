/**
 * External dependencies
 */
import { isEmpty, trim } from 'lodash';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import { errorNotice, successNotice } from 'state/notices/actions';
import { applyDnsTemplate } from 'state/domains/dns/actions';

class EmailProvider extends Component {
	state = {
		token: '',
		submitting: false,
	};

	onChange = ( event ) => {
		const { value } = event.target;

		this.setState( { token: trim( value ) } );
	};

	onAddDnsRecords = ( event ) => {
		event.preventDefault();
		this.setState( { submitting: true } );

		const { domain, translate, template } = this.props;
		let variables = {
			token: this.state.token,
			domain,
		};

		if ( template.modifyVariables ) {
			variables = template.modifyVariables( variables );
		}

		this.props
			.applyDnsTemplate(
				domain,
				template.dnsTemplateProvider,
				template.dnsTemplateService,
				variables
			)
			.then(
				() => {
					this.props.successNotice(
						translate( "Hooray! We've successfully added DNS records for this service." ),
						{ duration: 5000 }
					);
				},
				( error ) => {
					this.props.errorNotice(
						error.message ||
							translate( "We weren't able to add DNS records for this service. Please try again." )
					);
				}
			)
			.finally( () => {
				this.setState( { submitting: false } );
			} );
	};

	render() {
		const { template, translate } = this.props;
		const { token, submitting } = this.state;
		const { name, label, placeholder, validationPattern } = template;
		const isDataValid = token.match( validationPattern );

		return (
			<form className="dns__form">
				<FormFieldset>
					<FormLabel htmlFor="dns-template-token">{ label }</FormLabel>
					<FormTextInput
						id="dns-template-token"
						key={ `dns-templates-token-${ name }` }
						name="token"
						isError={ ! isEmpty( token ) && ! isDataValid }
						onChange={ this.onChange }
						placeholder={ placeholder }
					/>
					{ token && ! isDataValid && (
						<FormInputValidation text={ translate( 'Invalid Token' ) } isError />
					) }
				</FormFieldset>
				<FormFooter>
					<FormButton disabled={ ! isDataValid || submitting } onClick={ this.onAddDnsRecords }>
						{ translate( 'Set up %(providerName)s', {
							args: { providerName: name },
							comment:
								'%(providerName)s will be replaced with the name of the service ' +
								'provider that this template is used for, for example G Suite or Office 365',
						} ) }
					</FormButton>
				</FormFooter>
			</form>
		);
	}
}

export default connect( null, {
	applyDnsTemplate,
	errorNotice,
	successNotice,
} )( localize( EmailProvider ) );
