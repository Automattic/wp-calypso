/**
 * External dependencies
 */
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import debugFactory from 'debug';

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
import { isEnabled } from 'config';
import SectionHeader from 'components/section-header';

const debug = debugFactory( 'calypso:me:profile' );

export default protectForm( React.createClass( {

	displayName: 'Profile',

	mixins: [ formBase, LinkedStateMixin, observe( 'userSettings' ), eventRecorder ],

	componentDidMount() {
		debug( this.displayName + ' component is mounted.' );
	},

	componentWillUnmount() {
		debug( this.displayName + ' component is unmounting.' );
	},

	render() {
		const gravatarProfileLink = 'https://gravatar.com/' + this.props.userSettings.getSetting( 'user_login' );

		return (
			<Main className="profile">
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<SectionHeader label={ this.translate( 'Profile' ) } />
				<Card className="me-profile-settings">
					{ isEnabled( 'me/edit-gravatar' ) && <EditGravatar /> }

					<form onSubmit={ this.submitForm } onChange={ this.props.markChanged }>
						<FormFieldset>
							<FormLabel htmlFor="first_name">{ this.translate( 'First Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="first_name"
								name="first_name"
								onFocus={ this.recordFocusEvent( 'First Name Field' ) }
								valueLink={ this.valueLink( 'first_name' ) } />
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="last_name">{ this.translate( 'Last Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="last_name"
								name="last_name"
								onFocus={ this.recordFocusEvent( 'Last Name Field' ) }
								valueLink={ this.valueLink( 'last_name' ) } />
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="display_name">{ this.translate( 'Public Display Name' ) }</FormLabel>
							<FormTextInput
								disabled={ this.getDisabledState() }
								id="display_name"
								name="display_name"
								onFocus={ this.recordFocusEvent( 'Display Name Field' ) }
								valueLink={ this.valueLink( 'display_name' ) } />
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="description">{ this.translate( 'About Me' ) }</FormLabel>
							<FormTextarea
								disabled={ this.getDisabledState() }
								id="description"
								name="description"
								onFocus={ this.recordFocusEvent( 'About Me Field' ) }
								valueLink={ this.valueLink( 'description' ) }>
							</FormTextarea>
						</FormFieldset>

						<p>
							<FormButton
								disabled={ ! this.props.userSettings.hasUnsavedSettings() || this.getDisabledState() }
								onClick={ this.recordClickEvent( 'Save Profile Details Button' ) }>
								{ this.state.submittingForm ? this.translate( 'Saving…' ) : this.translate( 'Save Profile Details' ) }
							</FormButton>
						</p>
					</form>
					<p className="me-profile-settings__info-text">
						{ this.translate(
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
									)
								}
							}
						) }
					</p>
				</Card>

				<ProfileLinks userProfileLinks={ userProfileLinks } />

			</Main>
		);
	}
} ) );
