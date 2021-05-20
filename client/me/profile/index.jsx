/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight as compose } from 'lodash';
import { localize } from 'i18n-calypso';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import withFormBase from 'calypso/me/form-base/with-form-base';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Main from 'calypso/components/main';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import ProfileLinks from 'calypso/me/profile-links';
import ReauthRequired from 'calypso/me/reauth-required';
import SectionHeader from 'calypso/components/section-header';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import { protectForm } from 'calypso/lib/protect-form';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

class Profile extends React.Component {
	getClickHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	}

	getFocusHandler( action ) {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	}

	toggleGravatarHidden = ( isHidden ) => {
		this.props.setUserSetting( 'gravatar_profile_hidden', isHidden );
	};

	render() {
		const gravatarProfileLink = 'https://gravatar.com/' + this.props.getSetting( 'user_login' );

		return (
			<Main className="profile">
				<PageViewTracker path="/me" title="Me > My Profile" />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<FormattedHeader
					brandFont
					headerText={ this.props.translate( 'My Profile' ) }
					align="left"
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

						<FormFieldset>
							<ToggleControl
								checked={ this.props.getSetting( 'gravatar_profile_hidden' ) }
								onChange={ this.toggleGravatarHidden }
								label={ this.props.translate(
									'{{spanLead}}Hide my Gravatar profile.{{/spanLead}} {{spanExtra}}This will prevent your {{profileLink}}Gravatar profile{{/profileLink}} and photo from appearing on any site. It may take some time for the changes to take effect. Gravatar profiles can be deleted at {{deleteLink}}Gravatar.com{{/deleteLink}}.{{/spanExtra}}',
									{
										components: {
											spanLead: <strong className="profile__link-destination-label-lead" />,
											spanExtra: <span className="profile__link-destination-label-extra" />,
											profileLink: (
												<a href={ gravatarProfileLink } target="_blank" rel="noreferrer" />
											),
											deleteLink: (
												<a
													href="https://gravatar.com/account/disable/"
													target="_blank"
													rel="noreferrer"
												/>
											),
										},
									}
								) }
							/>
						</FormFieldset>

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

				<ProfileLinks />
			</Main>
		);
	}
}

export default compose(
	connect( null, { recordGoogleEvent } ),
	protectForm,
	localize,
	withFormBase
)( Profile );
