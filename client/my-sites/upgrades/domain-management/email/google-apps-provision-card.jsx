/**
 * External dependencies
 */
const React = require( 'react' );
/**
 * Internal dependencies
 */
const countriesList = require( 'lib/countries-list' ).forDomainRegistrations(),
	formState = require( 'lib/form-state' ),
	FormButton = require( 'components/forms/form-button' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormFooter = require( 'my-sites/upgrades/domain-management/components/form-footer' ),
	FormLabel = require( 'components/forms/form-label' ),
	{ CountrySelect } = require( 'my-sites/upgrades/components/form' ),
	Notice = require ( 'components/notice' ),
	wpcom = require( 'lib/wp' );

const GoogleAppsProvisionCard = React.createClass( {
	propTypes: {
		googleAppsProvisionData: React.PropTypes.object.isRequired
	},

	fieldNames: [
		'name',
		'company',
		'zip',
		'country'
	],

	getInitialState() {
		return {
			form: null,
			submitting: false,
			error: false,
			pendingActivation: false
		};
	},

	componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.initialState(),
			onNewState: this.setFormState,
			validatorFunction: this.validate
		}	);

		this.setFormState( this.formStateController.getInitialState() );
	},

	setFormState( fields ) {
		this.setState( { fields } );
	},

	initialState() {
		const data = this.props.googleAppsProvisionData.items;
		return {
			name: data.name,
			company: data.company,
			zip: data.zip,
			country: data.country
		};
	},

	onChange( event ) {
		this.formStateController.handleFieldChange( event.target );
	},

	changeType( event ) {
		const fields = this.getFieldsForType( event.target.value );
		this.setState( { type: event.target.value } );
		this.formStateController.resetFields( fields );
	},

	handleContinue( event ) {
		event.preventDefault();
		const base = this;

		this.startSubmit();

		wpcom.undocumented().updateGoogleAppsProvisioning( this.props.domain, {
			name: this.state.fields.name.value,
			company: this.state.fields.company.value,
			zip: this.state.fields.zip.value,
			country: this.state.fields.country.value
		}, function( error, response ) {
			if ( response && response.success ) {
				base.setState( { submitting: false } );
				base.setState( { pendingActivation: true } );
			} else {
				base.setState( { error: error.message } );
			}
		} );
	},

	startSubmit() {
		this.setState( { error: false, submitting: true } );
	},

	renderNotice() {
		if ( this.state.error ) {
			return (
				<Notice
					status="is-error"
					showDismiss={ false }
					text={ this.state.error } />
			);
		} else {
			return (
				<Notice
					status="is-info"
					showDismiss={ false }
					text={ this.translate( 'There was a problem activating your Google Apps account.  ' +
						'Please correct the information below.' ) } />
			);
		}
	},

	renderActivationPending() {
		return (
			<div>
				Your Google Apps account is being setup, you will get an email to complete setup shortly.
			</div>
		)
	},

	renderForm() {
		return (
			<div className="card">
				{ this.renderNotice() }
				<form className="provision-gapps-data__form">
					<div className="google-apps-provision__form-fieldsets">
						<FormFieldset>
							<FormLabel htmlFor="name">Your Name</FormLabel>
							<FormTextInput
								placeholder={ this.translate( 'Your Name' ) }
								name="name"
								value={ formState.getFieldValue( this.state.fields, 'name' ) }
								isError={ formState.isFieldInvalid( this.state.fields, 'name' ) }
								maxLength={ 60 }
								isError={ false }
								onChange={ this.onChange } />

							<FormLabel htmlFor="company">Company</FormLabel>
							<FormTextInput
								placeholder={ this.translate( 'Company (Optional)' ) }
								name="company"
								value={ formState.getFieldValue( this.state.fields, 'company' ) }
								isError={ formState.isFieldInvalid( this.state.fields, 'company' ) }
								maxLength={ 60 }
								isError={ false }
								onChange={ this.onChange } />

							<FormLabel htmlFor="zip">Postal Code</FormLabel>
							<FormTextInput
								placeholder={ this.translate( 'Postal Code' ) }
								name="zip"
								value={ formState.getFieldValue( this.state.fields, 'zip' ) }
								isError={ formState.isFieldInvalid( this.state.fields, 'zip' ) }
								maxLength={ 60 }
								isError={ false }
								onChange={ this.onChange } />

							<CountrySelect
								label={ this.translate( 'Country' ) }
								countriesList={ countriesList }
								onChange={ this.onChange }
								value={ formState.getFieldValue( this.state.fields, 'country' ) } />
						</FormFieldset>
					</div>
					<FormFooter className="provision-gapps-data__footer">
						<FormButton
							type="button"
							disabled={ this.state.submitting ? true : false }
							onClick={ this.handleContinue }>
							{ this.translate( 'Update' ) }
						</FormButton>

						<FormButton
							disabled={ this.state.submitting ? true : false }
							type="button"
							isPrimary={ false }
							onClick={ this.handleCancel }>
							{ this.translate( 'Cancel' ) }
						</FormButton>
					</FormFooter>
				</form>
			</div>
		)
	},

	render() {
		if ( this.state.pendingActivation ) {
			return this.renderActivationPending();
		} else {
			return this.renderForm();
		}
	}
} );

module.exports = GoogleAppsProvisionCard;
