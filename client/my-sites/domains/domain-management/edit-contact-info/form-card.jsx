import page from '@automattic/calypso-router';
import { Dialog } from '@automattic/components';
import { camelToSnakeCase, mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { localize } from 'i18n-calypso';
import { get, includes, isEmpty, isEqual, snakeCase } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ContactDetailsFormFields from 'calypso/components/domains/contact-details-form-fields';
import { registrar as registrarNames } from 'calypso/lib/domains/constants';
import { findRegistrantWhois } from 'calypso/lib/domains/whois/utils';
import wp from 'calypso/lib/wp';
import DesignatedAgentNotice from 'calypso/my-sites/domains/domain-management/components/designated-agent-notice';
import TransferLockOptOutForm from 'calypso/my-sites/domains/domain-management/components/transfer-lock-opt-out-form';
import { domainManagementEdit, isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { requestWhois, saveWhois } from 'calypso/state/domains/management/actions';
import {
	getWhoisData,
	getWhoisSaveError,
	getWhoisSaveSuccess,
	isUpdatingWhois,
} from 'calypso/state/domains/management/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { createUserEmailPendingUpdate } from 'calypso/state/user-settings/thunks/create-user-email-pending-update';
import getPreviousPath from '../../../../state/selectors/get-previous-path';

import './style.scss';

class EditContactInfoFormCard extends Component {
	static propTypes = {
		selectedDomain: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		currentUser: PropTypes.object.isRequired,
		domainRegistrationAgreementUrl: PropTypes.string.isRequired,
		isUpdatingWhois: PropTypes.bool,
		previousPath: PropTypes.string,
		whoisData: PropTypes.array,
		whoisSaveError: PropTypes.object,
		whoisSaveSuccess: PropTypes.bool,
		showContactInfoNote: PropTypes.bool,
		backUrl: PropTypes.string.isRequired,
		bulkEdit: PropTypes.bool,
		wwdDomains: PropTypes.arrayOf( PropTypes.object ),
		bulkUpdateContactInfo: PropTypes.func,
		forceShowTransferLockOptOut: PropTypes.bool,
	};

	constructor( props ) {
		super( props );

		this.state = {
			formSubmitting: false,
			transferLock: true,
			showNonDaConfirmationDialog: false,
			hasEmailChanged: false,
			requiresConfirmation: false,
			haveContactDetailsChanged: false,
			updateWpcomEmail: false,
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
		wp.req
			.post(
				'/me/domain-contact-information/validate',
				mapRecordKeysRecursively(
					{
						contactInformation: fieldValues,
						domainNames: [ this.props.selectedDomain.name ],
					},
					camelToSnakeCase
				)
			)
			.then( ( data ) => {
				onComplete( null, mapRecordKeysRecursively( data.messages || {}, snakeToCamelCase ) );
			} )
			.catch( ( error ) => {
				onComplete( error );
			} );
	};

	requiresConfirmation( newContactDetails ) {
		const { firstName, lastName, organization, email } = this.getContactFormFieldValues();
		const isWwdDomain =
			this.props.selectedDomain.registrar === registrarNames.WWD ||
			( this.props.bulkEdit && this.props.wwdDomains?.length > 0 );

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
		const { domainRegistrationAgreementUrl, translate, forceShowTransferLockOptOut } = this.props;
		const registrationDatePlus60Days = moment
			.utc( this.props.selectedDomain.registrationDate )
			.add( 60, 'days' );
		const isLocked = moment.utc().isSameOrBefore( registrationDatePlus60Days );

		if ( forceShowTransferLockOptOut || ! isLocked ) {
			return (
				<>
					<TransferLockOptOutForm
						disabled={ this.state.formSubmitting }
						onChange={ this.onTransferLockOptOutChange }
					/>
					<DesignatedAgentNotice
						domainRegistrationAgreementUrl={ domainRegistrationAgreementUrl }
						saveButtonLabel={ translate( 'Save contact info' ) }
					/>
				</>
			);
		}
	}

	renderBackupEmail() {
		const { email } = this.getContactFormFieldValues();
		const wpcomEmail = this.props.currentUser.email;
		const strong = <strong />;

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
				{ this.props.bulkEdit && this.props.wwdDomains?.length > 0 && (
					<>
						<span>{ translate( 'Confirmation is needed for the following domains:' ) }</span>
						<ul>
							{ this.props.wwdDomains.map( ( domain ) => (
								<li key={ domain }>
									<strong>{ domain.domain }</strong>
								</li>
							) ) }
						</ul>
					</>
				) }
				<p>{ text }</p>
				{ email !== wpcomEmail && this.renderBackupEmail() }
			</Dialog>
		);
	}

	needsFax() {
		const NETHERLANDS_TLD = '.nl';
		const { fax } = this.getContactFormFieldValues();

		return this.props.selectedDomain.name.endsWith( NETHERLANDS_TLD ) || !! fax;
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

	handleUpdateWpcomEmailCheckboxChange = ( value ) => {
		this.setState( { updateWpcomEmail: value } );
	};

	saveContactInfo = () => {
		const { selectedDomain } = this.props;
		const { formSubmitting, transferLock, newContactDetails, updateWpcomEmail } = this.state;

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
				if ( this.props.bulkEdit ) {
					this.updateWpcomEmail( newContactDetails, updateWpcomEmail );
					this.props.bulkUpdateContactInfo?.(
						newContactDetails,
						transferLock,
						this.getNoticeMessage()
					);
					return;
				}
				this.props.saveWhois(
					selectedDomain.name,
					newContactDetails,
					transferLock,
					updateWpcomEmail
				);
			}
		);

		this.updateWpcomEmail( newContactDetails, updateWpcomEmail );
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

		this.showNoticeAndGoBack( this.getNoticeMessage() );
	};

	getNoticeMessage = () => {
		if ( ! this.state.requiresConfirmation ) {
			return this.props.translate(
				'The contact info has been updated. ' +
					'There may be a short delay before the changes show up in the public records.'
			);
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

		return message;
	};

	getReturnDestination = () => {
		if ( isUnderDomainManagementAll( this.props.currentRoute ) ) {
			return this.props.backUrl;
		}

		const domainName = this.props.selectedDomain.name;
		const siteSlug = this.props.selectedSite.slug;
		return domainManagementEdit( siteSlug, domainName, this.props.currentRoute );
	};

	showNoticeAndGoBack = ( message ) => {
		this.props.successNotice( message, {
			showDismiss: true,
			isPersistent: true,
			duration: 5000,
		} );
		page( this.getReturnDestination() );
	};

	onWhoisUpdateError = () => {
		const message =
			get( this.props.whoisSaveError, 'message' ) ||
			this.props.translate(
				'There was a problem updating your contact info. ' +
					'Please try again later or contact support.'
			);

		this.props.errorNotice( message );
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

	handleCancelButtonClick = () => {
		page( this.props.backUrl );
	};

	getIsFieldDisabled = ( name ) => {
		if ( this.props.bulkEdit && ! this.state.formSubmitting ) {
			return false;
		}
		const unmodifiableFields = get(
			this.props,
			[ 'selectedDomain', 'whoisUpdateUnmodifiableFields' ],
			[]
		);
		return this.state.formSubmitting || includes( unmodifiableFields, snakeCase( name ) );
	};

	updateWpcomEmail( newContactDetails, updateWpcomEmail ) {
		const { email } = newContactDetails;
		if ( updateWpcomEmail && email && this.props.currentUser.email !== email ) {
			this.props.createUserEmailPendingUpdate( email );
		}
	}

	shouldDisableSubmitButton() {
		const { haveContactDetailsChanged, formSubmitting } = this.state;
		return formSubmitting === true || haveContactDetailsChanged === false;
	}

	shouldDisableUpdateWpcomEmailCheckbox() {
		const { email: newContactEmail = null } = this.state.newContactDetails || {};
		const { email: wpcomEmail = null } = this.props.currentUser || {};
		return wpcomEmail === newContactEmail;
	}

	render() {
		const { selectedDomain, showContactInfoNote, translate, forceShowTransferLockOptOut } =
			this.props;
		const canUseDesignatedAgent = selectedDomain.transferLockOnWhoisUpdateOptional;
		const whoisRegistrantData = this.getContactFormFieldValues();

		if ( Object.values( whoisRegistrantData ).every( ( value ) => isEmpty( value ) ) ) {
			return null;
		}

		const updateWpcomEmailCheckboxDisabled = this.shouldDisableUpdateWpcomEmailCheckbox();
		return (
			<>
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
						onCancel={ this.handleCancelButtonClick }
						onValidate={ this.validate }
						labelTexts={ { submitButton: translate( 'Save contact info' ) } }
						disableSubmitButton={ this.shouldDisableSubmitButton() }
						isSubmitting={ this.state.formSubmitting }
						updateWpcomEmailCheckboxDisabled={ updateWpcomEmailCheckboxDisabled }
						onUpdateWpcomEmailCheckboxChange={ this.handleUpdateWpcomEmailCheckboxChange }
					>
						{ ( forceShowTransferLockOptOut || canUseDesignatedAgent ) &&
							this.renderTransferLockOptOut() }
					</ContactDetailsFormFields>
				</form>
				{ this.renderDialog() }
			</>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			currentRoute: getCurrentRoute( state ),
			currentUser: getCurrentUser( state ),
			isUpdatingWhois: isUpdatingWhois( state, ownProps.selectedDomain.name ),
			previousPath: getPreviousPath( state ),
			whoisData: getWhoisData( state, ownProps.selectedDomain.name ),
			whoisSaveError: getWhoisSaveError( state, ownProps.selectedDomain.name ),
			whoisSaveSuccess: getWhoisSaveSuccess( state, ownProps.selectedDomain.name ),
		};
	},
	{
		errorNotice,
		fetchSiteDomains,
		requestWhois,
		saveWhois,
		successNotice,
		createUserEmailPendingUpdate,
	}
)( localize( EditContactInfoFormCard ) );
