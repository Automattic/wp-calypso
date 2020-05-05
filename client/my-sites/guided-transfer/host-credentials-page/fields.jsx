/**
 * This module contains a collection of mini components for composing
 * host details pages
 *
 */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import SpinnerButton from 'components/spinner-button';

export const Username = localize( ( props ) => (
	<FormFieldset className="host-credentials-page__account-username-fieldset">
		<FormLabel htmlFor="username">
			{ props.translate( '%(host)s account username', {
				args: {
					host: props.hostLabel,
				},
			} ) }
		</FormLabel>
		<FormTextInput
			id="username"
			value={ props.value || '' }
			disabled={ props.disabled }
			onChange={ props.onChange }
			placeholder={ props.translate( 'Username' ) }
		/>
	</FormFieldset>
) );

export const Password = localize( ( props ) => (
	<FormFieldset className="host-credentials-page__account-password-fieldset">
		<FormLabel htmlFor="password">
			{ props.translate( '%(host)s account password', {
				args: {
					host: props.hostLabel,
				},
			} ) }
		</FormLabel>
		<FormPasswordInput
			id="password"
			autoCapitalize="off"
			autoComplete="off"
			autoCorrect="off"
			value={ props.value || '' }
			disabled={ props.disabled }
			onChange={ props.onChange }
			placeholder={ props.translate( 'Password' ) }
		/>
	</FormFieldset>
) );

export const Email = localize( ( props ) => (
	<FormFieldset className="host-credentials-page__account-email-fieldset">
		<FormLabel htmlFor="email">
			{ props.translate( '%(host)s account email address', {
				args: {
					host: props.hostLabel,
				},
			} ) }
		</FormLabel>
		<FormTextInput
			id="email"
			value={ props.value || '' }
			disabled={ props.disabled }
			onChange={ props.onChange }
			placeholder={ props.translate( 'Email address' ) }
		/>
	</FormFieldset>
) );

export const CreateAccountTip = localize( ( props ) => (
	<FormSettingExplanation className="host-credentials-page__account-info-tip">
		{ props.translate(
			"You don't have a %(host)s account yet? " +
				'{{host_link}}Create one{{/host_link}} and return here.',
			{
				components: {
					host_link: <a href={ props.hostUrl } target="_blank" rel="noopener noreferrer" />,
				},
				args: {
					host: props.hostLabel,
				},
			}
		) }
	</FormSettingExplanation>
) );

export const WPOrgURL = localize( ( props ) => (
	<FormFieldset className="host-credentials-page__account-wporg_url-fieldset">
		<FormLabel htmlFor="wporg_url">{ props.translate( "New site's web address" ) }</FormLabel>
		<FormTextInput
			id="wporg_url"
			value={ props.value || '' }
			disabled={ props.disabled }
			onChange={ props.onChange }
			placeholder={ props.translate( 'new-site.com' ) }
		/>
	</FormFieldset>
) );

export const SubmitSection = localize( ( props ) => (
	<CompactCard>
		<SpinnerButton
			onClick={ props.submit }
			text={ props.translate( 'Continue' ) }
			loadingText={ props.translate( 'Saving…' ) }
			loading={ props.isSubmitting }
		/>
	</CompactCard>
) );
