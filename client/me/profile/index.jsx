/** @format */

/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import { protectForm } from 'lib/protect-form';
import formBase from 'me/form-base';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import EditGravatar from 'blocks/edit-gravatar';
import ProfileLinks from 'me/profile-links';
import userProfileLinks from 'lib/user-profile-links';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';
import Card from 'components/card';
import observe from 'lib/mixins/data-observe';
import eventRecorder from 'me/event-recorder';
import Main from 'components/main';
import SectionHeader from 'components/section-header';

const debug = debugFactory( 'calypso:me:profile' );

const Profile = createReactClass( {
	displayName: 'Profile',

	mixins: [ formBase, observe( 'userSettings' ), eventRecorder ],

	componentDidMount() {
		debug( this.displayName + ' component is mounted.' );
	},

	componentWillUnmount() {
		debug( this.displayName + ' component is unmounting.' );
	},

	render() {
		const gravatarProfileLink =
			'https://gravatar.com/' + this.props.userSettings.getSetting( 'user_login' );

		return (
			<Main className="profile">
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<SectionHeader label={ this.props.translate( 'Profile' ) } />
				<Card className="me-profile-settings">
					<EditGravatar />

					<form onSubmit={ this.submitForm } onChange={ this.props.markChanged }>
						<FormFieldset>
							<FormLabel htmlFor="first_name">{ this.props.translate( 'First Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="first_name"
								name="first_name"
								onChange={ this.updateSetting }
								onFocus={ this.recordFocusEvent( 'First Name Field' ) }
								value={ this.getSetting( 'first_name' ) }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="last_name">{ this.props.translate( 'Last Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="last_name"
								name="last_name"
								onChange={ this.updateSetting }
								onFocus={ this.recordFocusEvent( 'Last Name Field' ) }
								value={ this.getSetting( 'last_name' ) }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="display_name">
								{ this.props.translate( 'Public Display Name' ) }
							</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="display_name"
								name="display_name"
								onChange={ this.updateSetting }
								onFocus={ this.recordFocusEvent( 'Display Name Field' ) }
								value={ this.getSetting( 'display_name' ) }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="description">{ this.props.translate( 'About Me' ) }</FormLabel>
							<FormTextarea
								disabled={ this.getDisabledState() }
								id="description"
								name="description"
								onChange={ this.updateSetting }
								onFocus={ this.recordFocusEvent( 'About Me Field' ) }
								value={ this.getSetting( 'description' ) }
							/>
						</FormFieldset>

						<p>
							<FormButton
								disabled={
									! this.props.userSettings.hasUnsavedSettings() || this.getDisabledState()
								}
								onClick={ this.recordClickEvent( 'Save Profile Details Button' ) }
							>
								{ this.state.submittingForm
									? this.props.translate( 'Saving…' )
									: this.props.translate( 'Save Profile Details' ) }
							</FormButton>
						</p>
					</form>
					<p className="me-profile-settings__info-text">
						{ this.props.translate(
							'This information will be displayed publicly on {{profilelink}}your profile{{/profilelink}} and in ' +
								'{{hovercardslink}}Gravatar Hovercards{{/hovercardslink}}.',
							{
								components: {
									profilelink: (
										<a
											onClick={ this.recordClickEvent( 'My Profile Link' ) }
											href={ gravatarProfileLink }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
									hovercardslink: (
										<a
											onClick={ this.recordClickEvent( 'Gravatar Hovercards Link' ) }
											href="https://support.wordpress.com/gravatar-hovercards/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</Card>

				<ProfileLinks userProfileLinks={ userProfileLinks } />
			</Main>
		);
	},
} );

export default flowRight( protectForm, localize )( Profile );
