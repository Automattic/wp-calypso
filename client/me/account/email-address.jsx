/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash-es';

/**
 * Internal dependencies
 */
import { cancelPendingEmailChange, setUserSetting } from 'state/user-settings/actions';
import FormTextInput from 'components/forms/form-text-input';
import FormTextValidation from 'components/forms/form-input-validation';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import getOriginalUserSetting from 'state/selectors/get-original-user-setting';
import getUnsavedUserSettings from 'state/selectors/get-unsaved-user-settings';
import getUserSetting from 'state/selectors/get-user-setting';
import isPendingEmailChange from 'state/selectors/is-pending-email-change';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

class AccountSettingsEmailAddress extends React.Component {
	static propTypes = {
		debug: PropTypes.func,
		emailValidationListener: PropTypes.func,
		errorNotice: PropTypes.func.isRequired,
		focusHandler: PropTypes.func,
		isSubmitting: PropTypes.func.isRequired,
		successNotice: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		userSettings: PropTypes.object,
	};

	static defaultProps = {
		debug: noop,
		focusHandler: noop,
	};

	constructor( props ) {
		super( props );
		this.state = {
			emailValidationError: false,
			initialHasPendingEmailChange: this.hasPendingEmailChange( props ),
			isCancellingPendingEmailChange: false,
		};
		this.cancelEmailChange = this.cancelEmailChange.bind( this );
		this.updateEmailAddress = this.updateEmailAddress.bind( this );
		// Flag the address as invalid if it is unchanged.
		props.emailValidationListener &&
			props.emailValidationListener( this.isEmailAddressUnchanged( props ) );
	}

	getEmailAddress( props ) {
		if ( this.hasPendingEmailChange( props ) ) {
			return this.getPendingEmailAddress( props );
		}
		if ( props.userSettings ) {
			return props.userSettings.getSetting( 'user_email' );
		}
		if ( props.unsavedUserSettings && typeof props.unsavedUserSettings.user_email === 'string' ) {
			return props.unsavedUserSettings.user_email;
		}
		return props.originalEmailAddress;
	}

	getOriginalEmailAddress( props ) {
		if ( props.userSettings ) {
			return props.userSettings.getOriginalSetting( 'user_email' );
		}
		return props.originalEmailAddress;
	}

	getPendingEmailAddress( props ) {
		if ( props.userSettings ) {
			if ( props.userSettings.isPendingEmailChange() ) {
				return props.userSettings.getSetting( 'new_user_email' );
			}
			return null;
		}
		if ( props.hasPendingEmailChange ) {
			return props.pendingEmailAddress;
		}
		return null;
	}

	hasPendingEmailChange( props ) {
		// Rely on userSettings when we have them; fall back on state if not.
		return props.userSettings
			? props.userSettings.isPendingEmailChange()
			: props.hasPendingEmailChange;
	}

	cancelEmailChange() {
		const { debug, errorNotice, successNotice, translate, userSettings } = this.props;
		this.setState( { isCancellingPendingEmailChange: true } );
		const errorMessage = translate(
			'There was a problem canceling the email change. Please, try again.'
		);
		if ( userSettings ) {
			const thisComponent = this;
			userSettings.cancelPendingEmailChange( ( error, response ) => {
				const newState = {
					isCancellingPendingEmailChange: false,
				};
				if ( error ) {
					debug( 'Error canceling email change: ' + JSON.stringify( error ) );
					errorNotice( errorMessage );
				} else {
					newState.initialHasPendingEmailChange = false;
					debug( JSON.stringify( 'Email change canceled successfully' + response ) );
					successNotice( thisComponent.getCancelEmailChangeSuccessMessage() );
				}
				thisComponent.setState( newState );
			} );
			return;
		}

		this.props.cancelPendingEmailChange( () => {
			this.setState( { isCancellingPendingEmailChange: false } );
			errorNotice( errorMessage );
		} );
	}

	getCancelEmailChangeSuccessMessage() {
		return this.props.translate( 'The email change has been successfully canceled.' );
	}

	updateEmailAddress( event ) {
		const { value } = event.target;
		const { emailValidationListener, userSettings } = this.props;
		const emailValidationError =
			( '' === value && 'empty' ) || ( ! emailValidator.validate( value ) && 'invalid' ) || false;
		this.setState( { emailValidationError } );
		if ( userSettings ) {
			userSettings.updateSetting( 'user_email', value );
		} else {
			this.props.setUserSetting( 'user_email', value );
		}
		const newEmailIsInvalid =
			false !== emailValidationError || this.isEmailAddressUnchanged( this.props, value );
		emailValidationListener && emailValidationListener( newEmailIsInvalid );
	}

	isEmailAddressUnchanged( props, newEmailAddress ) {
		const originalEmailAddress = props.userSettings
			? props.userSettings.getOriginalSetting( 'user_email' )
			: props.originalEmailAddress;
		let emailToCompare;
		if ( newEmailAddress ) {
			emailToCompare = newEmailAddress;
		} else if ( props.userSettings ) {
			emailToCompare = props.userSettings.getSetting( 'user_email' );
		} else {
			emailToCompare = props.workingEmailAddress;
		}
		return originalEmailAddress === emailToCompare;
	}

	checkCancelEmailChangeSuccess() {
		// Add a sanity check for cases where we cancelled a pending email change,
		// but only discover that as a result of an update to our props connected
		// to the relevant state.
		const { successNotice } = this.props;
		if (
			! this.state.isCancellingPendingEmailChange ||
			this.hasPendingEmailChange( this.props ) ||
			! this.state.initialHasPendingEmailChange
		) {
			return;
		}
		this.setState( { isCancellingPendingEmailChange: false, initialHasPendingEmailChange: false } );
		successNotice( this.getCancelEmailChangeSuccessMessage() );
	}

	renderEmailValidation() {
		const { translate, unsavedUserSettings, userSettings } = this.props;

		let unsavedEmail;
		if ( userSettings ) {
			if ( ! userSettings.isSettingUnsaved( 'user_email' ) ) {
				return null;
			}
			unsavedEmail = userSettings.getSetting( 'user_email' );
		} else {
			if ( ! unsavedUserSettings || typeof unsavedUserSettings.user_email !== 'string' ) {
				return null;
			}
			unsavedEmail = unsavedUserSettings.user_email;
		}

		if ( ! this.state.emailValidationError ) {
			return null;
		}

		let notice;
		switch ( this.state.emailValidationError ) {
			case 'empty':
				notice = translate( 'Email address can not be empty.' );
				break;
			case 'invalid':
			default:
				notice = translate( '%(email)s is not a valid email address.', {
					args: { email: unsavedEmail },
				} );
				break;
		}

		return <FormTextValidation isError={ true } text={ notice } />;
	}

	renderPendingEmailChange() {
		const { translate } = this.props;

		if ( ! this.hasPendingEmailChange( this.props ) ) {
			return null;
		}

		return (
			<Notice
				showDismiss={ false }
				status="is-info"
				text={ translate(
					'There is a pending change of your email to %(email)s. Please check your inbox for a confirmation link.',
					{
						args: {
							email: this.getPendingEmailAddress( this.props ),
						},
					}
				) }
			>
				<NoticeAction onClick={ this.cancelEmailChange }>{ translate( 'Cancel' ) }</NoticeAction>
			</Notice>
		);
	}

	render() {
		this.checkCancelEmailChangeSuccess();
		const { focusHandler, isSubmitting, translate } = this.props;
		const emailAddress = this.getEmailAddress( this.props ) || '';
		return (
			<FormFieldset>
				<FormLabel htmlFor="user_email">{ translate( 'Email address' ) }</FormLabel>
				<FormTextInput
					disabled={
						this.hasPendingEmailChange( this.props ) ||
						isSubmitting() ||
						null === this.getOriginalEmailAddress( this.props )
					}
					id="user_email"
					name="user_email"
					isError={ !! this.state.emailValidationError }
					onFocus={ focusHandler || noop }
					value={ emailAddress }
					onChange={ this.updateEmailAddress }
				/>
				{ this.renderEmailValidation() }
				{ this.renderPendingEmailChange() }
				<FormSettingExplanation>
					{ translate( 'Will not be publicly displayed' ) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}
}

export default connect(
	( state ) => ( {
		hasPendingEmailChange: isPendingEmailChange( state ),
		originalEmailAddress: getOriginalUserSetting( state, 'user_email' ),
		pendingEmailAddress: getOriginalUserSetting( state, 'new_user_email' ),
		unsavedUserSettings: getUnsavedUserSettings( state ),
		workingEmailAddress: getUserSetting( state, 'user_email' ),
	} ),
	{ cancelPendingEmailChange, setUserSetting }
)( localize( AccountSettingsEmailAddress ) );
