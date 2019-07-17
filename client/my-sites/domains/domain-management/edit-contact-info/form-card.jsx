/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { endsWith, get, isEqual, omit, includes, snakeCase } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import notices from 'notices';
import { domainManagementContactsPrivacy } from 'my-sites/domains/paths';
import wp from 'lib/wp';
import { successNotice } from 'state/notices/actions';
import { UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES } from 'lib/url/support';
import { registrar as registrarNames } from 'lib/domains/constants';
import DesignatedAgentNotice from 'my-sites/domains/domain-management/components/designated-agent-notice';
import Dialog from 'components/dialog';
import { getCurrentUser } from 'state/current-user/selectors';
import ContactDetailsFormFields from 'components/domains/contact-details-form-fields';
import { saveWhois } from 'state/domains/management/actions';
import {
	isUpdatingWhois,
	getWhoisData,
	getWhoisSaveError,
	getWhoisSaveSuccess,
} from 'state/domains/management/selectors';

const wpcom = wp.undocumented();

class EditContactInfoFormCard extends React.Component {
	static propTypes = {
		contactInformation: PropTypes.object.isRequired,
		selectedDomain: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		currentUser: PropTypes.object.isRequired,
		domainRegistrationAgreementUrl: PropTypes.string.isRequired,
		isUpdatingWhois: PropTypes.bool,
		whoisData: PropTypes.array,
		whoisSaveError: PropTypes.object,
		whoisSaveSuccess: PropTypes.bool,
	};

	constructor( props ) {
		super( props );

		this.state = {
			notice: null,
			formSubmitting: false,
			transferLock: true,
			showNonDaConfirmationDialog: false,
			hasEmailChanged: false,
			requiresConfirmation: false,
			haveContactDetailsChanged: false,
		};

		this.contactFormFieldValues = this.getContactFormFieldValues();
	}

	componentDidUpdate( prevProps ) {
		if ( this.state.formSubmitting && prevProps.isUpdatingWhois && ! this.props.isUpdatingWhois ) {
			this.handleFormSubmittingComplete();

			if ( this.props.whoisSaveSuccess ) {
				this.onWhoisUpdateSuccess();
				return;
			}

			if ( this.props.whoisSaveError ) {
				this.onWhoisUpdateError();
				return;
			}
		}
	}

	getContactFormFieldValues() {
		return omit( this.props.contactInformation, [ 'countryName', 'stateName', 'type' ] );
	}

	validate = ( fieldValues, onComplete ) => {
		wpcom.validateDomainContactInformation(
			fieldValues,
			[ this.props.selectedDomain.name ],
			( error, data ) => {
				if ( error ) {
					onComplete( error );
				} else {
					onComplete( null, data.messages || {} );
				}
			}
		);
	};

	requiresConfirmation( newContactDetails ) {
		const { firstName, lastName, organization, email } = this.props.contactInformation;
		const isWwdDomain = this.props.selectedDomain.registrar === registrarNames.WWD;

		const primaryFieldsChanged = ! (
			firstName === newContactDetails.firstName &&
			lastName === newContactDetails.lastName &&
			organization === newContactDetails.organization &&
			email === newContactDetails.email
		);
		return isWwdDomain && primaryFieldsChanged;
	}

	handleDialogClose = () => this.setState( { showNonDaConfirmationDialog: false } );

	handleFormSubmittingComplete = () => this.setState( { formSubmitting: false } );

	renderTransferLockOptOut() {
		const { domainRegistrationAgreementUrl, translate } = this.props;
		return (
			<div>
				<FormLabel>
					<FormCheckbox
						name="transfer-lock-opt-out"
						disabled={ this.state.formSubmitting }
						onChange={ this.onTransferLockOptOutChange }
					/>
					<span>
						{ translate( 'Opt-out of the {{link}}60-day transfer lock{{/link}}.', {
							components: {
								link: (
									<a
										href={ UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</span>
				</FormLabel>
				<DesignatedAgentNotice
					domainRegistrationAgreementUrl={ domainRegistrationAgreementUrl }
					saveButtonLabel={ translate( 'Save Contact Info' ) }
				/>
			</div>
		);
	}

	renderBackupEmail() {
		const currentEmail = this.props.contactInformation.email,
			wpcomEmail = this.props.currentUser.email,
			strong = <strong />;

		return (
			<p>
				{ this.props.translate(
					'If you don’t have access to {{strong}}%(currentEmail)s{{/strong}}, ' +
						'we will also email you at {{strong}}%(wpcomEmail)s{{/strong}}, as backup.',
					{
						args: { currentEmail, wpcomEmail },
						components: { strong },
					}
				) }
			</p>
		);
	}

	renderDialog() {
		const { translate } = this.props;
		const { hasEmailChanged, newContactDetails = {} } = this.state;
		const strong = <strong />;
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'confirm',
				label: translate( 'Request Confirmation' ),
				onClick: this.saveContactInfo,
				isPrimary: true,
			},
		];
		const currentEmail = this.props.contactInformation.email;
		const wpcomEmail = this.props.currentUser.email;

		let text;

		if ( hasEmailChanged && newContactDetails.email ) {
			text = translate(
				'We’ll email you at {{strong}}%(oldEmail)s{{/strong}} and {{strong}}%(newEmail)s{{/strong}} ' +
					'with a link to confirm the new details. The change won’t go live until we receive confirmation from both emails.',
				{
					args: { oldEmail: currentEmail, newEmail: newContactDetails.email },
					components: { strong },
				}
			);
		} else {
			text = translate(
				'We’ll email you at {{strong}}%(currentEmail)s{{/strong}} with a link to confirm the new details. ' +
					"The change won't go live until we receive confirmation from this email.",
				{ args: { currentEmail }, components: { strong } }
			);
		}
		return (
			<Dialog
				isVisible={ this.state.showNonDaConfirmationDialog }
				buttons={ buttons }
				onClose={ this.handleDialogClose }
			>
				<h1>{ translate( 'Confirmation Needed' ) }</h1>
				<p>{ text }</p>
				{ currentEmail !== wpcomEmail && this.renderBackupEmail() }
			</Dialog>
		);
	}

	needsFax() {
		const NETHERLANDS_TLD = '.nl';

		return (
			endsWith( this.props.selectedDomain.name, NETHERLANDS_TLD ) ||
			!! this.props.contactInformation.fax
		);
	}

	onTransferLockOptOutChange = event => this.setState( { transferLock: ! event.target.checked } );

	goToContactsPrivacy = () =>
		page(
			domainManagementContactsPrivacy(
				this.props.selectedSite.slug,
				this.props.selectedDomain.name
			)
		);

	showNonDaConfirmationDialog = () => this.setState( { showNonDaConfirmationDialog: true } );

	handleContactDetailsChange = newContactDetails => {
		const { email } = newContactDetails;
		this.setState( {
			newContactDetails,
			haveContactDetailsChanged: ! isEqual( this.contactFormFieldValues, newContactDetails ),
			hasEmailChanged: get( this.props, 'contactInformation.email' ) !== email,
		} );
	};

	saveContactInfo = () => {
		const { selectedDomain } = this.props;
		const { formSubmitting, transferLock, newContactDetails } = this.state;

		if ( formSubmitting ) {
			return;
		}

		this.setState(
			{
				formSubmitting: true,
				showNonDaConfirmationDialog: false,
			},
			() => {
				this.props.saveWhois( selectedDomain.name, newContactDetails, transferLock );
			}
		);
	};

	onWhoisUpdateSuccess = () => {
		this.contactFormFieldValues = this.getContactFormFieldValues();

		this.setState( {
			haveContactDetailsChanged: ! isEqual(
				this.contactFormFieldValues,
				this.state.newContactDetails
			),
		} );

		if ( ! this.state.requiresConfirmation ) {
			this.props.successNotice(
				this.props.translate(
					'The contact info has been updated. ' +
						'There may be a short delay before the changes show up in the public records.'
				)
			);
			return;
		}

		const currentEmail = this.props.contactInformation.email;
		const strong = <strong />;
		const { hasEmailChanged, newContactDetails = {} } = this.state;
		let message;

		if ( hasEmailChanged && newContactDetails.email ) {
			message = this.props.translate(
				'Emails have been sent to {{strong}}%(oldEmail)s{{/strong}} and {{strong}}%(newEmail)s{{/strong}}. ' +
					"Please ensure they're both confirmed to finish this process.",
				{
					args: { oldEmail: currentEmail, newEmail: newContactDetails.email },
					components: { strong },
				}
			);
		} else {
			message = this.props.translate(
				'An email has been sent to {{strong}}%(email)s{{/strong}}. ' +
					'Please confirm it to finish this process.',
				{
					args: { email: currentEmail },
					components: { strong },
				}
			);
		}

		this.props.successNotice( message );
	};

	onWhoisUpdateError = () => {
		const message =
			this.props.whoisSaveError ||
			this.props.translate(
				'There was a problem updating your contact info. ' +
					'Please try again later or contact support.'
			);

		notices.error( message );
	};

	handleSubmitButtonClick = newContactDetails => {
		this.setState(
			{
				requiresConfirmation: this.requiresConfirmation( newContactDetails ),
				newContactDetails,
			},
			() => {
				if ( this.state.requiresConfirmation ) {
					this.showNonDaConfirmationDialog();
				} else {
					this.saveContactInfo();
				}
			}
		);
	};

	getIsFieldDisabled = name => {
		const unmodifiableFields = get(
			this.props,
			[ 'selectedDomain', 'whoisUpdateUnmodifiableFields' ],
			[]
		);
		return this.state.formSubmitting || includes( unmodifiableFields, snakeCase( name ) );
		// return this.props.isWhoisUpdating || includes( unmodifiableFields, snakeCase( name ) );
	};

	shouldDisableSubmitButton() {
		const { haveContactDetailsChanged, formSubmitting } = this.state;
		return formSubmitting === true || haveContactDetailsChanged === false;
		// return this.props.isUpdatingWhois === true || haveContactDetailsChanged === false;
	}

	render() {
		const { selectedDomain, translate } = this.props;
		const canUseDesignatedAgent = selectedDomain.transferLockOnWhoisUpdateOptional;

		return (
			<Card>
				<form>
					<ContactDetailsFormFields
						eventFormName="Edit Contact Info"
						contactDetails={ this.state.newContactDetails || this.contactFormFieldValues }
						needsFax={ this.needsFax() }
						getIsFieldDisabled={ this.getIsFieldDisabled }
						onContactDetailsChange={ this.handleContactDetailsChange }
						onSubmit={ this.handleSubmitButtonClick }
						onValidate={ this.validate }
						labelTexts={ { submitButton: translate( 'Save Contact Info' ) } }
						onCancel={ this.goToContactsPrivacy }
						disableSubmitButton={ this.shouldDisableSubmitButton() }
					>
						{ canUseDesignatedAgent && this.renderTransferLockOptOut() }
					</ContactDetailsFormFields>
				</form>
				{ this.renderDialog() }
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			currentUser: getCurrentUser( state ),
			isUpdatingWhois: isUpdatingWhois( state, ownProps.selectedDomain.name ),
			whoisData: getWhoisData( state, ownProps.selectedDomain.name ),
			whoisSaveError: getWhoisSaveError( state, ownProps.selectedDomain.name ),
			whoisSaveSuccess: getWhoisSaveSuccess( state, ownProps.selectedDomain.name ),
		};
	},
	{
		saveWhois,
		successNotice,
	}
)( localize( EditContactInfoFormCard ) );
