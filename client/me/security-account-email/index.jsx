/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AccountSettingsEmailAddress from 'me/account/email-address';
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import { errorNotice, successNotice } from 'state/notices/actions';
import FormButton from 'components/forms/form-button';
import HeaderCake from 'components/header-cake';
import isFetchingUserSettings from 'state/selectors/is-fetching-user-settings';
import isPendingEmailChange from 'state/selectors/is-pending-email-change';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryUserSettings from 'components/data/query-user-settings';
import ReauthRequired from 'me/reauth-required';
import { saveUserSettings } from 'state/user-settings/actions';
import twoStepAuthorization from 'lib/two-step-authorization';

class SecurityAccountEmail extends React.Component {
	static propTypes = {
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			emailIsValid: true,
		};
		this.isSubmitting = this.isSubmitting.bind( this );
		this.setEmailValidationState = this.setEmailValidationState.bind( this );
		this.submitEmailForm = this.submitEmailForm.bind( this );
	}

	setEmailValidationState( emailIsValid ) {
		this.setState( { emailIsValid } );
	}

	isSubmitting() {
		return this.props.isFetchingUserSettings;
	}

	canSubmit() {
		return this.state.emailIsValid && ! this.props.isPendingEmailChange;
	}

	submitEmailForm( event ) {
		event.preventDefault();

		this.setState( { isSubmitting: true } );

		this.props.saveUserSettings( null, function ( error ) {
			const errorMessage = error.message
				? error.message
				: this.props.translate( 'There was a problem updating your email address.' );
			this.props.errorNotice( errorMessage );
		} );
	}

	render() {
		const { path, translate } = this.props;

		return (
			<Main className="security security-account-email">
				<PageViewTracker path={ path } title="Me > Security Account Email" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<MeSidebarNavigation />

				<DocumentHead title={ translate( 'Account Email' ) } />

				<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
					{ translate( 'Account Email' ) }
				</HeaderCake>

				<QueryUserSettings />
				<Card className="security-account-email__settings">
					<form onSubmit={ this.submitEmailForm }>
						<AccountSettingsEmailAddress
							emailValidationListener={ this.setEmailValidationState }
							errorNotice={ this.props.errorNotice }
							//focusHandler={ this.getFocusHandler( 'Email Address Field' ) }
							isSubmitting={ this.isSubmitting }
							successNotice={ this.props.successNotice }
						/>
						<FormButton isSubmitting={ this.isSubmitting() } disabled={ ! this.canSubmit() }>
							{ this.isSubmitting()
								? translate( 'Updating…' )
								: translate( 'Update account email' ) }
						</FormButton>
					</form>
				</Card>
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		isFetchingUserSettings: isFetchingUserSettings( state ),
		isPendingEmailChange: isPendingEmailChange( state ),
	} ),
	{ errorNotice, saveUserSettings, successNotice }
)( localize( SecurityAccountEmail ) );
