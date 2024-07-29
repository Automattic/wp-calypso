import { Card, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
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

	openGravatarQuickEditor = () => {
		const email = encodeURIComponent( this.props.getSetting( 'user_email' ) );
		const width = 400;
		const height = 720;
		const left = window.screenLeft + ( window.outerWidth - width ) / 2;
		const top = window.screenTop + ( window.outerHeight - height ) / 2;

		window.open(
			`https://gravatar.com/profile?is_quick_editor=true&email=${ email }`,
			'_blank',
			`width=${ width },height=${ height },left=${ left },top=${ top }`
		);
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
						</FormFieldset>

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
									'Your profile is powered by Gravatar. Your Gravatar is public by default and may appear on any site using Gravatar when you’re logged in with {{strong}}%(email)s{{/strong}}.' +
										' To manage your profile and privacy settings, {{button}}visit your Gravatar profile here{{/button}}.',
									{
										components: {
											strong: <strong />,
											button: (
												<button
													className="profile__gravatar-profile-button"
													onClick={ this.openGravatarQuickEditor }
												/>
											),
										},
										args: {
											email: this.props.getSetting( 'user_email' ),
										},
									}
								) }
							</span>
							<span>
								<svg
									width="61"
									height="40"
									viewBox="0 0 61 40"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect
										x="0.171631"
										y="0.137756"
										width="39.6178"
										height="39.7231"
										rx="19.8089"
										fill="#3858E9"
									/>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M25.3394 29.16L28.5322 19.9049C29.1266 18.4091 29.3262 17.2148 29.3262 16.1524C29.3262 15.7684 29.3004 15.408 29.2558 15.0735C30.071 16.5646 30.5362 18.2795 30.5362 20.1004C30.5362 23.9659 28.4476 27.3415 25.3394 29.1577V29.16ZM21.5241 15.1889C22.1537 15.156 22.7199 15.09 22.7199 15.09C23.2814 15.024 23.2156 14.1925 22.6541 14.2255C22.6541 14.2255 20.9626 14.3574 19.8678 14.3574C18.8388 14.3574 17.1143 14.2255 17.1143 14.2255C16.5505 14.1925 16.4847 15.057 17.0486 15.09C17.0486 15.09 17.5819 15.156 18.1457 15.1889L19.7738 19.6646L17.4855 26.5429L13.6796 15.1866C14.3116 15.1536 14.8754 15.0877 14.8754 15.0877C15.4369 15.0217 15.3711 14.1902 14.8096 14.2231C14.8096 14.2231 13.1181 14.3551 12.0233 14.3551C11.8283 14.3551 11.5957 14.3503 11.349 14.3433C13.2215 11.5024 16.433 9.62265 20.0839 9.62265C22.8068 9.62265 25.283 10.6662 27.1414 12.3764C27.0967 12.374 27.0521 12.3669 27.0074 12.3669C25.9784 12.3669 25.2525 13.2644 25.2525 14.2255C25.2525 15.09 25.7482 15.8202 26.2815 16.6847C26.6785 17.382 27.1437 18.2795 27.1437 19.5751C27.1437 20.4726 26.8782 21.6009 26.3473 22.9648L25.3042 26.4581L21.5264 15.1937V15.1889H21.5241ZM20.0839 30.5828C19.0573 30.5828 18.0682 30.4297 17.1308 30.1564L20.2672 21.0191L23.4811 29.8455C23.5022 29.8973 23.5281 29.9444 23.5563 29.9892C22.4685 30.3708 21.3009 30.5828 20.0863 30.5828H20.0839ZM9.63167 20.1004C9.63167 18.581 9.95823 17.1394 10.5362 15.8344L15.5215 29.5322C12.0327 27.8338 9.63167 24.2509 9.63167 20.1004ZM20.0839 8.4472C13.6749 8.4472 8.45935 13.6766 8.45935 20.1027C8.45935 26.5288 13.6749 31.7583 20.0839 31.7583C26.4929 31.7583 31.7085 26.5288 31.7085 20.1027C31.7085 13.6766 26.4953 8.4472 20.0839 8.4472Z"
										fill="white"
									/>
									<rect
										x="21.0619"
										y="0.137878"
										width="39.6181"
										height="39.7231"
										rx="19.809"
										fill="#4678EB"
									/>
									<path
										d="M38.7451 11.4952V18.9357C38.7451 19.4993 38.969 20.0398 39.3675 20.4384C39.7661 20.8369 40.3066 21.0608 40.8702 21.0608C41.4338 21.0608 41.9743 20.8369 42.3728 20.4384C42.7714 20.0398 42.9953 19.4993 42.9953 18.9357V13.9856C44.2996 14.4454 45.4191 15.3167 46.1851 16.4682C46.9511 17.6197 47.3221 18.9889 47.2422 20.3696C47.1623 21.7503 46.6358 23.0676 45.7421 24.123C44.8483 25.1784 43.6358 25.9147 42.2871 26.221C40.9385 26.5273 39.5268 26.387 38.2649 25.8212C37.003 25.2554 35.9591 24.2947 35.2907 23.084C34.6222 21.8733 34.3654 20.4781 34.5588 19.1087C34.7523 17.7393 35.3857 16.4699 36.3634 15.4918C36.7555 15.0915 36.9738 14.5525 36.9709 13.9921C36.968 13.4317 36.7441 12.8951 36.3479 12.4988C35.9516 12.1026 35.415 11.8786 34.8546 11.8757C34.2942 11.8728 33.7552 12.0912 33.3549 12.4833C31.616 14.2222 30.5338 16.5103 30.2928 18.9576C30.0517 21.4049 30.6668 23.8601 32.033 25.9048C33.3993 27.9496 35.4323 29.4573 37.7856 30.1711C40.1389 30.8849 42.6669 30.7606 44.9388 29.8195C47.2108 28.8783 49.0861 27.1785 50.2453 25.0097C51.4044 22.8408 51.7757 20.3372 51.2958 17.9253C50.816 15.5133 49.5146 13.3425 47.6136 11.7825C45.7125 10.2225 43.3294 9.36996 40.8702 9.37012C40.3066 9.37012 39.7661 9.59401 39.3675 9.99254C38.969 10.3911 38.7451 10.9316 38.7451 11.4952Z"
										fill="white"
									/>
								</svg>
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
