import { Button, Card, FormLabel } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';

export default function WPCloudSignupForm( props: { onNext: () => void } ) {
	const { onNext } = props;

	const translate = useTranslate();

	return (
		<Card>
			<div className="wpcloud-signup-form__title">{ translate( 'Sign up for WP Cloud' ) }</div>
			<div className="wpcloud-signup-form__description">
				{ translate( 'Tell us about yourself and your business.' ) }
			</div>
			<div className="wpcloud-signup-form__name">
				<div className="wpcloud-signup-form__first-name">
					<FormLabel>{ translate( 'First Name' ) }</FormLabel>
					<FormTextInput />
				</div>
				<div className="wpcloud-signup-form__last-name">
					<FormLabel>{ translate( 'Last Name' ) }</FormLabel>
					<FormTextInput />
				</div>
			</div>
			<div className="wpcloud-signup-form__business-name">
				<FormLabel>{ translate( 'Business Name' ) }</FormLabel>
				<FormTextInput />
			</div>
			<div className="wpcloud-signup-form__business-url">
				<FormLabel>{ translate( 'URL' ) }</FormLabel>
				<FormTextInput />
			</div>
			<div className="wpcloud-signup-form__consent1">
				<CheckboxControl onChange={ () => {} } />
				<FormLabel>
					{ translate( 'I agree to the WP Cloud Terms and Conditions and Privacy Statement.' ) }
				</FormLabel>
			</div>
			<div className="wpcloud-signup-form__consent2">
				<CheckboxControl onChange={ () => {} } />
				<FormLabel>
					{ translate(
						'I plan to use WP Cloud to provide cloud hosing to good clients. I have good intentions. I am not a hacker.'
					) }
				</FormLabel>
			</div>
			<Button primary onClick={ onNext }>
				{ translate( 'Next' ) }
			</Button>
		</Card>
	);
}
