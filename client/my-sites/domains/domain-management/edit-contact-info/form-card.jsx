/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { endsWith, get, isEmpty, isEqual, includes, snakeCase } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Dialog } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import notices from 'notices';
import { domainManagementContactsPrivacy } from 'my-sites/domains/paths';
import wp from 'lib/wp';
import { successNotice } from 'state/notices/actions';
import { UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES } from 'lib/url/support';
import { registrar as registrarNames } from 'lib/domains/constants';
import DesignatedAgentNotice from 'my-sites/domains/domain-management/components/designated-agent-notice';
import { getCurrentUser } from 'state/current-user/selectors';
import ContactDetailsFormFields from 'components/domains/contact-details-form-fields';
import { requestWhois, saveWhois } from 'state/domains/management/actions';
import { fetchSiteDomains } from 'state/sites/domains/actions';
import {
	isUpdatingWhois,
	getWhoisData,
	getWhoisSaveError,
	getWhoisSaveSuccess,
} from 'state/domains/management/selectors';
import { findRegistrantWhois } from 'lib/domains/whois/utils';

const wpcom = wp.undocumented();

import './style.scss';

class EditContactInfoFormCard extends React.Component {
	static propTypes = {
		selectedDomain: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		currentUser: PropTypes.object.isRequired,
		domainRegistrationAgreementUrl: PropTypes.string.isRequired,
		isUpdatingWhois: PropTypes.bool,
		whoisData: PropTypes.array,
		whoisSaveError: PropTypes.object,
		whoisSaveSuccess: PropTypes.bool,
		showContactInfoNote: PropTypes.bool,
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

		this.fetchWhois();
	}

	componentDidUpdate( prevProps ) {
		this.fetchWhois();

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

	fetchWhois = () => {
		if ( isEmpty( this.props.whoisData ) && ! isEmpty( this.props.selectedDomain.name ) ) {
			this.props.requestWhois( this.props.selectedDomain.name );
		}
	};

	getContactFormFieldValues() {
		const registrantWhoisData = findRegistrantWhois( this.props.whoisData );

		return {
			firstName: get( registrantWhoisData, 'fname' ),
			lastName: get( registrantWhoisData, 'lname' ),
			organization: get( registrantWhoisData, 'org' ),
			email: get( registrantWhoisData, 'email' ),
			phone: get( registrantWhoisData, 'phone' ),
			address1: get( registrantWhoisData, 'sa1' ),
			address2: get( registrantWhoisData, 'sa2' ),
			city: get( registrantWhoisData, 'city' ),
			state: get( registrantWhoisData, 'state' ),
			countryCode: get( registrantWhoisData, 'country_code' ),
			postalCode: get( registrantWhoisData, 'pc' ),
			fax: get( registrantWhoisData, 'fax' ),
		};
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
		const { firstName, lastName, organization, email } = this.getContactFormFieldValues();
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
					saveButtonLabel={ translate( 'Save contact info' ) }
				/>
			</div>
		);
	}

	renderBackupEmail() {
		const { email } = this.getContactFormFieldValues(),
			wpcomEmail = this.props.currentUser.email,
			strong = <strong />;

		return (
			<p>
				{ this.props.translate(
					'If you don’t have access to {{strong}}%(email)s{{/strong}}, ' +
						'we will also email you at {{strong}}%(wpcomEmail)s{{/strong}}, as backup.',
					{
						args: { email, wpcomEmail },
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
		const { email } = this.getContactFormFieldValues();
		const wpcomEmail = this.props.currentUser.email;

		let text;

		if ( hasEmailChanged && newContactDetails.email ) {
			text = translate(
				'We’ll email you at {{strong}}%(oldEmail)s{{/strong}} and {{strong}}%(newEmail)s{{/strong}} ' +
					'with a link to confirm the new details. The change won’t go live until we receive confirmation from both emails.',
				{
					args: { oldEmail: email, newEmail: newContactDetails.email },
					components: { strong },
				}
			);
		} else {
			text = translate(
				'We’ll email you at {{strong}}%(email)s{{/strong}} with a link to confirm the new details. ' +
					"The change won't go live until we receive confirmation from this email.",
				{ args: { email }, components: { strong } }
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
				{ email !== wpcomEmail && this.renderBackupEmail() }
			</Dialog>
		);
	}

	needsFax() {
		const NETHERLANDS_TLD = '.nl';
		const { fax } = this.getContactFormFieldValues();

		return endsWith( this.props.selectedDomain.name, NETHERLANDS_TLD ) || !! fax;
	}

	onTransferLockOptOutChange = ( event ) =>
		this.setState( { transferLock: ! event.target.checked } );

	showNonDaConfirmationDialog = () => this.setState( { showNonDaConfirmationDialog: true } );

	handleContactDetailsChange = ( newContactDetails ) => {
		const { email } = newContactDetails;
		const registrantWhoisData = this.getContactFormFieldValues();

		this.setState( {
			newContactDetails,
			haveContactDetailsChanged: ! isEqual( registrantWhoisData, newContactDetails ),
			hasEmailChanged: get( registrantWhoisData, 'email' ) !== email,
		} );
	};

	saveContactInfo = () => {
		const { selectedDomain } = this.props;
		const { formSubmitting, transferLock, newContactDetails } = this.state;

		if ( formSubmitting ) {
			return;
		}

		this.contactFormFieldValues = newContactDetails;

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
		this.props.fetchSiteDomains( this.props.selectedSite.ID );
		this.props.requestWhois( this.props.selectedDomain.name );

		this.setState( {
			haveContactDetailsChanged: ! isEqual(
				this.contactFormFieldValues,
				this.state.newContactDetails
			),
		} );

		if ( ! this.state.requiresConfirmation ) {
			this.showNoticeAndGoBack(
				this.props.translate(
					'The contact info has been updated. ' +
						'There may be a short delay before the changes show up in the public records.'
				)
			);
			return;
		}

		const { email } = this.getContactFormFieldValues();
		const strong = <strong />;
		const { hasEmailChanged, newContactDetails = {} } = this.state;
		let message;

		if ( hasEmailChanged && newContactDetails.email ) {
			message = this.props.translate(
				'Emails have been sent to {{strong}}%(oldEmail)s{{/strong}} and {{strong}}%(newEmail)s{{/strong}}. ' +
					"Please ensure they're both confirmed to finish this process.",
				{
					args: { oldEmail: email, newEmail: newContactDetails.email },
					components: { strong },
				}
			);
		} else {
			message = this.props.translate(
				'An email has been sent to {{strong}}%(email)s{{/strong}}. ' +
					'Please confirm it to finish this process.',
				{
					args: { email: email },
					components: { strong },
				}
			);
		}

		this.showNoticeAndGoBack( message );
	};

	showNoticeAndGoBack = ( message ) => {
		this.props.successNotice( message, {
			showDismiss: true,
			isPersistent: true,
			duration: 5000,
		} );
		page(
			domainManagementContactsPrivacy(
				this.props.selectedSite.slug,
				this.props.selectedDomain.name
			)
		);
	};

	onWhoisUpdateError = () => {
		const message =
			get( this.props.whoisSaveError, 'message' ) ||
			this.props.translate(
				'There was a problem updating your contact info. ' +
					'Please try again later or contact support.'
			);

		notices.error( message );
	};

	handleSubmitButtonClick = ( newContactDetails ) => {
		this.setState(
			{
				requiresConfirmation: this.requiresConfirmation( newContactDetails ),
				newContactDetails,
			},
			() => {
				this.contactFormFieldValues = this.getContactFormFieldValues();

				if ( this.state.requiresConfirmation ) {
					this.showNonDaConfirmationDialog();
				} else {
					this.saveContactInfo();
				}
			}
		);
	};

	getIsFieldDisabled = ( name ) => {
		const unmodifiableFields = get(
			this.props,
			[ 'selectedDomain', 'whoisUpdateUnmodifiableFields' ],
			[]
		);
		return this.state.formSubmitting || includes( unmodifiableFields, snakeCase( name ) );
	};

	shouldDisableSubmitButton() {
		const { haveContactDetailsChanged, formSubmitting } = this.state;
		return formSubmitting === true || haveContactDetailsChanged === false;
	}

	render() {
		const { selectedDomain, showContactInfoNote, translate } = this.props;
		const canUseDesignatedAgent = selectedDomain.transferLockOnWhoisUpdateOptional;
		const whoisRegistrantData = this.getContactFormFieldValues();

		if ( Object.values( whoisRegistrantData ).every( ( value ) => isEmpty( value ) ) ) {
			return null;
		}

		return (
			<Card>
				{ showContactInfoNote && (
					<p className="edit-contact-info__note">
						<em>
							{ translate( 'Domain owners are required to provide correct contact information.' ) }
						</em>
					</p>
				) }
				<form>
					<ContactDetailsFormFields
						eventFormName="Edit Contact Info"
						contactDetails={ whoisRegistrantData }
						needsFax={ this.needsFax() }
						getIsFieldDisabled={ this.getIsFieldDisabled }
						onContactDetailsChange={ this.handleContactDetailsChange }
						onSubmit={ this.handleSubmitButtonClick }
						onValidate={ this.validate }
						labelTexts={ { submitButton: translate( 'Save contact info' ) } }
						disableSubmitButton={ this.shouldDisableSubmitButton() }
						isSubmitting={ this.state.formSubmitting }
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
		fetchSiteDomains,
		requestWhois,
		saveWhois,
		successNotice,
	}
)( localize( EditContactInfoFormCard ) );
