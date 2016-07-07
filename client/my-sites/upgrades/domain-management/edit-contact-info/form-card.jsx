/**
 * External dependencies
 */
const React = require( 'react' ),
	endsWith = require( 'lodash/endsWith' ),
	omit = require( 'lodash/omit' ),
	page = require( 'page' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
const Card = require( 'components/card' ),
	FormButton = require( 'components/forms/form-button' ),
	FormCountrySelect = require( 'my-sites/upgrades/components/form/country-select' ),
	FormFooter = require( 'my-sites/upgrades/domain-management/components/form-footer' ),
	FormStateSelect = require( 'my-sites/upgrades/components/form/state-select' ),
	FormInput = require( 'my-sites/upgrades/components/form/input' ),
	ValidationErrorList = require( 'notices/validation-error-list' ),
	countriesList = require( 'lib/countries-list' ).forDomainRegistrations(),
	formState = require( 'lib/form-state' ),
	notices = require( 'notices' ),
	paths = require( 'my-sites/upgrades/paths' ),
	statesList = require( 'lib/states-list' ).forDomainRegistrations(),
	upgradesActions = require( 'lib/upgrades/actions' ),
	wpcom = require( 'lib/wp' ).undocumented(),
	successNotice = require( 'state/notices/actions' ).successNotice;

const EditContactInfoFormCard = React.createClass( {
	propTypes: {
		contactInformation: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState() {
		return {
			form: null,
			notice: null,
			formSubmitting: false
		};
	},

	componentWillMount() {
		const contactInformation = omit( this.props.contactInformation, [ 'countryName', 'stateName' ] );

		this.formStateController = formState.Controller( {
			initialFields: contactInformation,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	validate( formValues, onComplete ) {
		wpcom.validateDomainContactInformation( formValues, [ this.props.selectedDomainName ], ( error, data ) => {
			if ( error ) {
				onComplete( error );
			} else {
				onComplete( null, data.messages || {} );
			}
		} );
	},

	setFormState( state ) {
		if ( ! this.isMounted() ) {
			return;
		}

		const messages = formState.getErrorMessages( state );

		if ( messages.length > 0 ) {
			const notice = notices.error( <ValidationErrorList messages={ messages }/> );
			this.setState( {
				form: state,
				notice: notice
			} );
		} else {
			if ( this.state.notice ) {
				notices.removeNotice( this.state.notice );
			}
			this.setState( {
				form: state,
				notice: null
			} );
		}
	},

	handleFormControllerError( error ) {
		if ( error ) {
			throw error;
		}
	},

	render() {
		return (
			<Card className="edit-contact-info-form-card">
				<form>
					<div className="edit-contact-info-form-card__form-content">
						{ this.getField( FormInput, {
							name: 'first-name',
							autofocus: true,
							label: this.translate( 'First Name', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'last-name',
							label: this.translate( 'Last Name', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'organization',
							label: this.translate( 'Organization', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'email',
							label: this.translate( 'Email', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'phone',
							label: this.translate( 'Phone', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.hasFaxField() ? this.getField( FormInput, {
							name: 'fax',
							label: this.translate( 'Fax', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) : null }
						{ this.getField( FormCountrySelect, {
							countriesList,
							name: 'country-code',
							label: this.translate( 'Country', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'address-1',
							label: this.translate( 'Address', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'address-2',
							label: this.translate( 'Address Line 2', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'city',
							label: this.translate( 'City', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormStateSelect, {
							countryCode: formState.getFieldValue( this.state.form, 'countryCode' ),
							statesList,
							name: 'state',
							label: this.translate( 'State', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'postal-code',
							label: this.translate( 'Postal Code', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
					</div>

					<FormFooter>
						<FormButton
							disabled={ this.state.formSubmitting }
							onClick={ this.saveContactInfo }>
							{ this.translate( 'Save Contact Info' ) }
						</FormButton>

						<FormButton
							type="button"
							isPrimary={ false }
							onClick={ this.goToContactsPrivacy }>
							{ this.translate( 'Cancel' ) }
						</FormButton>
					</FormFooter>
				</form>
			</Card>
		);
	},

	getField( Component, props ) {
		const { name } = props;

		return (
			<Component
				{ ...props }
				additionalClasses="edit-contact-info-field"
				disabled={ this.state.formSubmitting || formState.isFieldDisabled( this.state.form, name ) }
				isError={ formState.isFieldInvalid( this.state.form, name ) }
				value={ formState.getFieldValue( this.state.form, name ) }
				onChange={ this.onChange } />
		);
	},

	hasFaxField() {
		const NETHERLANDS_TLD = '.nl';

		return endsWith( this.props.selectedDomainName, NETHERLANDS_TLD );
	},

	onChange( event ) {
		const { name, value } = event.target;

		if ( this.isCountryField( name ) ) {
			this.resetStateField();
		}

		this.formStateController.handleFieldChange( {
			name,
			value
		} );
	},

	isCountryField( name ) {
		return name === 'country-code';
	},

	resetStateField() {
		this.formStateController.handleFieldChange( {
			name: 'state',
			value: '',
			hideError: true
		} );
	},

	goToContactsPrivacy() {
		page( paths.domainManagementContactsPrivacy( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	},

	saveContactInfo( event ) {
		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return;
		}

		this.setState( { formSubmitting: true } );

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				this.setState( { formSubmitting: false } );
				return;
			}
			upgradesActions.updateWhois( this.props.selectedDomainName, formState.getAllFieldValues( this.state.form ), ( error, data ) => {
				this.setState( { formSubmitting: false } );
				if ( data && data.success ) {
					this.props.successNotice( this.translate( 'The contact info has been updated. There may be a short delay before the changes show up in the public records.' ) );
				} else if ( error && error.message ) {
					notices.error( error.message );
				} else {
					notices.error( this.translate( 'There was a problem updating your contact info. Please try again later or contact support.' ) );
				}
			} );
		} );
	}
} );

module.exports = connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( EditContactInfoFormCard );
