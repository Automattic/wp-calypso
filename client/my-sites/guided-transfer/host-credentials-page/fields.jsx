/**
 * This module contains a collection of mini components for composing
 * host details pages
 */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import FormButton from 'components/forms/form-button';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

export const Username = localize( props =>
	<FormFieldset className="guided-transfer__account-username-fieldset">
		<FormLabel htmlFor="username">{ props.translate( '%(host)s account username', {
			args: {
				host: props.hostLabel
			}
		} ) }</FormLabel>
		<FormTextInput
			id="username"
			value={ props.value }
			onChange={ props.onChange }
			placeholder={ props.translate( 'Username' ) } />
	</FormFieldset>
);

export const Password = localize( props =>
	<FormFieldset className="guided-transfer__account-password-fieldset">
		<FormLabel htmlFor="password">{ props.translate( '%(host)s account password', {
			args: {
				host: props.hostLabel
			}
		} ) }</FormLabel>
		<FormPasswordInput
			id="password"
			autoCapitalize="off"
			autoComplete="off"
			autoCorrect="off"
			value={ props.value }
			onChange={ props.onChange }
			placeholder={ props.translate( 'Password' ) } />
	</FormFieldset>
);

export const Email = localize( props =>
	<FormFieldset className="guided-transfer__account-email-fieldset">
		<FormLabel htmlFor="email">
			{ props.translate( '%(host)s account email address', {
				args: {
					host: props.hostLabel
				}
			} ) }
		</FormLabel>
		<FormTextInput
			id="email"
			value={ props.value }
			onChange={ props.onChange }
			placeholder={ props.translate( 'Email address' ) } />
	</FormFieldset>
);

export const CreateAccountTip = localize( props =>
	<FormSettingExplanation className="guided-transfer__account-info-tip">
		{ props.translate(
			'You don\'t have a %(host)s account yet? ' +
			'{{host_link}}Create one{{/host_link}} and return here.', {
				components: {
					host_link: <a href={ props.hostUrl } />
				},
				args: {
					host: props.hostLabel
				}
			}
		) }
	</FormSettingExplanation>
);

export const SubmitSection = localize( props =>
	<CompactCard>
		<FormButton onClick={ props.submit }>Continue</FormButton>
	</CompactCard>
);
