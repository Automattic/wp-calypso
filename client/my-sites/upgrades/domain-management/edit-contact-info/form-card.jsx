/**
 * External dependencies
 */
import React from 'react';
import {
	endsWith,
	includes,
	omit
} from 'lodash';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormCountrySelect from 'my-sites/upgrades/components/form/country-select';
import FormFooter from 'my-sites/upgrades/domain-management/components/form-footer';
import FormStateSelect from 'my-sites/upgrades/components/form/state-select';
import FormInput from 'my-sites/upgrades/components/form/input';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import ValidationErrorList from 'notices/validation-error-list';
import countriesListBuilder from 'lib/countries-list';
import formState from 'lib/form-state';
import notices from 'notices';
import paths from 'my-sites/upgrades/paths';
import upgradesActions from 'lib/upgrades/actions';
import wp from 'lib/wp';
import { successNotice } from 'state/notices/actions';
import support from 'lib/url/support';
import { registrar as registrarNames } from 'lib/domains/constants';
import DesignatedAgentNotice from 'my-sites/upgrades/domain-management/components/designated-agent-notice';

const countriesList = countriesListBuilder.forDomainRegistrations();
const wpcom = wp.undocumented();

class EditContactInfoFormCard extends React.Component {
	static propTypes = {
		contactInformation: React.PropTypes.object.isRequired,
		selectedDomain: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	};

	constructor( props ) {
		super( props );
		this.state = {
			form: null,
			notice: null,
			formSubmitting: false,
			hasUnmounted: false,
			transferLock: true
		};
	}

	componentWillMount() {
		const contactInformation = omit( this.props.contactInformation, [ 'countryName', 'stateName' ] );

		this.formStateController = formState.Controller( {
			initialFields: contactInformation,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError
		} );

		this.setState( {
			form: this.formStateController.getInitialState(),
			hasUnmounted: false,
			transferLock: true
		} );
	}

	componentWillUnmount() {
		this.setState( {
			hasUnmounted: true
		} );
	}

	validate = ( formValues, onComplete ) => {
		wpcom.validateDomainContactInformation( formValues, [ this.props.selectedDomain.name ], ( error, data ) => {
			if ( error ) {
				onComplete( error );
			} else {
				onComplete( null, data.messages || {} );
			}
		} );
	}

	setFormState = ( state ) => {
		if ( this.state.hasUnmounted ) {
			return;
		}

		const messages = formState.getErrorMessages( state );

		if ( messages.length > 0 ) {
			const notice = notices.error( <ValidationErrorList messages={ messages } /> );
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
	}

	handleFormControllerError = ( error ) => {
		if ( error ) {
			throw error;
		}
	}

	renderTransferLockOptOut() {
		return (
			<div>
				<FormLabel>
					<FormCheckbox
						name="transfer-lock-opt-out"
						disabled={ this.state.formSubmitting }
						onChange={ this.onTransferLockOptOutChange } />
					<span>
						{ this.props.translate(
							'Opt-out of the {{link}}60-day transfer lock{{/link}}.',
							{
								components: {
									link:
										<a href={ support.UPDATE_CONTACT_INFORMATION } target="_blank" rel="noopener noreferrer" />
								}
							}
						) }
					</span>
				</FormLabel>
			</div>
		);
	}

	render() {
		const { translate } = this.props,
			{ OPENHRS, OPENSRS } = registrarNames,
			isTucowsDomain = includes( [ OPENHRS, OPENSRS ], this.props.selectedDomain.registrar ),
			saveButtonLabel = translate( 'Save Contact Info' );

		return (
			<Card>
				<form>
					<div className="edit-contact-info__form-content">
						{ this.getField( FormInput, {
							name: 'first-name',
							autoFocus: true,
							label: translate( 'First Name', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'last-name',
							label: translate( 'Last Name', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'organization',
							label: translate( 'Organization', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'email',
							label: translate( 'Email', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'phone',
							label: translate( 'Phone', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.hasFaxField() ? this.getField( FormInput, {
							name: 'fax',
							label: translate( 'Fax', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) : null }
						{ this.getField( FormCountrySelect, {
							countriesList,
							name: 'country-code',
							label: translate( 'Country', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'address-1',
							label: translate( 'Address', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'address-2',
							label: translate( 'Address Line 2', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'city',
							label: translate( 'City', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormStateSelect, {
							countryCode: formState.getFieldValue( this.state.form, 'countryCode' ),
							name: 'state',
							label: translate( 'State', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
						{ this.getField( FormInput, {
							name: 'postal-code',
							label: translate( 'Postal Code', {
								context: 'Domain Edit Contact Info form.',
								textOnly: true
							} )
						} ) }
					</div>

					{ isTucowsDomain && this.renderTransferLockOptOut() }
					{ isTucowsDomain && <DesignatedAgentNotice saveButtonLabel={ saveButtonLabel } /> }

					<FormFooter>
						<FormButton
							disabled={ this.state.formSubmitting }
							onClick={ this.saveContactInfo }>
							{ saveButtonLabel }
						</FormButton>

						<FormButton
							type="button"
							isPrimary={ false }
							disabled={ this.state.formSubmitting }
							onClick={ this.goToContactsPrivacy }>
							{ translate( 'Cancel' ) }
						</FormButton>
					</FormFooter>
				</form>
			</Card>
		);
	}

	getField( Component, props ) {
		const { name } = props;

		return (
			<Component
				{ ...props }
				additionalClasses="edit-contact-info__form-field"
				disabled={ this.state.formSubmitting || formState.isFieldDisabled( this.state.form, name ) }
				isError={ formState.isFieldInvalid( this.state.form, name ) }
				value={ formState.getFieldValue( this.state.form, name ) }
				onChange={ this.onChange } />
		);
	}

	hasFaxField() {
		const NETHERLANDS_TLD = '.nl';

		return endsWith( this.props.selectedDomain.name, NETHERLANDS_TLD );
	}

	onChange = ( event ) => {
		const { name, value } = event.target;

		if ( this.isCountryField( name ) ) {
			this.resetStateField();
		}

		this.formStateController.handleFieldChange( {
			name,
			value
		} );
	}

	onTransferLockOptOutChange = ( event ) => {
		this.setState( { transferLock: ! event.target.checked } );
	}

	isCountryField( name ) {
		return name === 'country-code';
	}

	resetStateField() {
		this.formStateController.handleFieldChange( {
			name: 'state',
			value: '',
			hideError: true
		} );
	}

	goToContactsPrivacy = () => {
		page( paths.domainManagementContactsPrivacy( this.props.selectedSite.slug, this.props.selectedDomain.name ) );
	}

	saveContactInfo = ( event ) => {
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
			upgradesActions.updateWhois(
				this.props.selectedDomain.name,
				formState.getAllFieldValues( this.state.form ),
				this.state.transferLock,
				this.onWhoisUpdate
			);
		} );
	}

	onWhoisUpdate = ( error, data ) => {
		this.setState( { formSubmitting: false } );
		if ( data && data.success ) {
			const { OPENHRS, OPENSRS, WWD } = registrarNames;
			let message;

			switch ( this.props.selectedDomain.registrar ) {
				case OPENHRS:
				case OPENSRS:
					message = this.props.translate(
						'The contact info has been updated. ' +
						'There may be a short delay before the changes show up in the public records.'
					);
					break;

				case WWD:
				default:
					message = this.props.translate(
						'Request confirmed - per ICANN regulations, before the changes are final, ' +
						'they must be accepted by the new registrant, and then the old one. ' +
						'To start this process, an email has been sent to {{strong}}%(email)s{{/strong}}.',
						{
							args: { email: formState.getFieldValue( this.state.form, 'email' ) },
							components: { strong: <strong /> }
						}
					);
					break;
			}

			this.props.successNotice( message );
		} else if ( error && error.message ) {
			notices.error( error.message );
		} else {
			notices.error( this.props.translate(
				'There was a problem updating your contact info. ' +
				'Please try again later or contact support.' ) );
		}
	}
}

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( localize( EditContactInfoFormCard ) );
