import { isEnabled } from '@automattic/calypso-config';
import { Card, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import DomainUpsell from 'calypso/me/domain-upsell';
import withFormBase from 'calypso/me/form-base/with-form-base';
import ProfileLinks from 'calypso/me/profile-links';
import ReauthRequired from 'calypso/me/reauth-required';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import WPAndGravatarLogo from './wp-and-gravatar-logo';

import './style.scss';

class Profile extends Component {
	getClickHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	}

	getFocusHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	}

	toggleIsDevAccount = ( isDevAccount ) => {
		this.props.setUserSetting( 'is_dev_account', isDevAccount );
	};

	render() {
		return (
			<Main wideLayout className="profile">
				<PageViewTracker path="/me" title="Me > My Profile" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<NavigationHeader
					navigationItems={ [] }
					title={ this.props.translate( 'My Profile' ) }
					subtitle={ this.props.translate(
						'Set your name, bio, and other public-facing information. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="manage-profile" showIcon={ false } />
								),
							},
						}
					) }
				/>

				<SectionHeader label={ this.props.translate( 'Profile' ) } />
				<Card className="profile__settings">
					<EditGravatar />

					<form onSubmit={ this.props.submitForm } onChange={ this.props.markChanged }>
						<FormFieldset>
							<FormLabel htmlFor="first_name">{ this.props.translate( 'First name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.props.getDisabledState() }
								id="first_name"
								name="first_name"
								onChange={ this.props.updateSetting }
								onFocus={ this.getFocusHandler( 'First Name Field' ) }
								value={ this.props.getSetting( 'first_name' ) }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="last_name">{ this.props.translate( 'Last name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.props.getDisabledState() }
								id="last_name"
								name="last_name"
								onChange={ this.props.updateSetting }
								onFocus={ this.getFocusHandler( 'Last Name Field' ) }
								value={ this.props.getSetting( 'last_name' ) }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="display_name">
								{ this.props.translate( 'Public display name' ) }
							</FormLabel>
							<FormTextInput
								disabled={ this.props.getDisabledState() }
								id="display_name"
								name="display_name"
								onChange={ this.props.updateSetting }
								onFocus={ this.getFocusHandler( 'Display Name Field' ) }
								value={ this.props.getSetting( 'display_name' ) }
							/>
							{ isEnabled( 'layout/site-level-user-profile' ) && (
								<FormSettingExplanation>
									{ this.props.translate( 'Shown publicly when you comment on other sites.' ) }
								</FormSettingExplanation>
							) }
						</FormFieldset>

						{ isEnabled( 'layout/site-level-user-profile' ) && (
							<FormFieldset>
								<FormLabel htmlFor="user_URL">
									{ this.props.translate( 'Public web address' ) }
								</FormLabel>
								<FormTextInput
									disabled={ this.props.getDisabledState() }
									id="user_URL"
									name="user_URL"
									type="url"
									onChange={ this.props.updateSetting }
									onFocus={ this.getFocusHandler( 'Web Address Field' ) }
									value={ this.props.getSetting( 'user_URL' ) }
								/>
								<FormSettingExplanation>
									{ this.props.translate( 'Shown publicly when you comment on other sites.' ) }
								</FormSettingExplanation>
							</FormFieldset>
						) }

						<FormFieldset>
							<FormLabel htmlFor="description">{ this.props.translate( 'About me' ) }</FormLabel>
							<FormTextarea
								disabled={ this.props.getDisabledState() }
								id="description"
								name="description"
								onChange={ this.props.updateSetting }
								onFocus={ this.getFocusHandler( 'About Me Field' ) }
								value={ this.props.getSetting( 'description' ) }
							/>
						</FormFieldset>

						<p className="profile__gravatar-profile-description">
							<span>
								{ this.props.translate(
									'Your WordPress.com profile is connected to Gravatar. Your Gravatar is public by default and may appear on any site using Gravatar when you’re logged in with {{strong}}%(email)s{{/strong}}.' +
										' To manage your Gravatar profile and visibility settings, {{a}}visit your Gravatar profile{{/a}}.',
									{
										components: {
											strong: <strong />,
											a: <a href="https://gravatar.com/profile" target="_blank" rel="noreferrer" />,
										},
										args: {
											email: this.props.getSetting( 'user_email' ),
										},
									}
								) }
							</span>
							<span>
								<WPAndGravatarLogo />
							</span>
						</p>

						<p className="profile__submit-button-wrapper">
							<FormButton
								disabled={ ! this.props.hasUnsavedUserSettings || this.props.getDisabledState() }
								onClick={ this.getClickHandler( 'Save Profile Details Button' ) }
							>
								{ this.props.getDisabledState()
									? this.props.translate( 'Saving…' )
									: this.props.translate( 'Save profile details' ) }
							</FormButton>
						</p>
					</form>
				</Card>

				<DomainUpsell context="profile" />

				<ProfileLinks />
			</Main>
		);
	}
}

export default compose(
	connect(
		( state ) => ( {
			isFetchingUserSettings: isFetchingUserSettings( state ),
		} ),
		{ recordGoogleEvent }
	),
	protectForm,
	localize,
	withFormBase
)( Profile );
