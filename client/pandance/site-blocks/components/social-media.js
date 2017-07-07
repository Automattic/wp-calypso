/**
 * External dependencies
 */
import React from 'react';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import SocialLogo from 'social-logos';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';


export const SocialMedia = props => <div>
	<Card>
		<a href="https://facebook.com/manuel"><SocialLogo size="48" icon="facebook" /></a>
		<a href="https://twitter.com/manuel"><SocialLogo size="48" icon="twitter-alt" /></a>
		<a href="https://instagram.com/manuel"><SocialLogo size="48" icon="instagram" /></a>
		<a href="https://manuel.wordpress.com/"><SocialLogo size="48" icon="wordpress" /></a>
	</Card>
</div>;

export const EditSocialMedia = props => <div className="wrapper">
	<h2>Tell us how to find you on social media.</h2>
	{
		[ 'Facebook', 'Twitter', 'Instagram' ]
			.map( socialNetwork => <FormFieldset>
					<FormLabel>{ socialNetwork }</FormLabel>
					<FormTextInput placeholder={ 'https://' + socialNetwork + '.com/' } />
				</FormFieldset>
			)
	}
</div>;
