import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';

export default function SelectNewsletterForm( { nextStepUrl } ) {
	const [ hasError, setHasError ] = useState( false );

	const handleAction = ( newsletterUrl: string ) => {
		if ( ! isValidUrl( newsletterUrl ) ) {
			setHasError( true );
			return;
		}

		const { hostname } = parseUrl( newsletterUrl );
		page( addQueryArgs( nextStepUrl, { newsletter: hostname } ) );
		return;
	};

	return (
		<Card>
			<div className="select-newsletter-form">
				<FormTextInputWithAction
					onAction={ handleAction }
					placeholder="http://example.substack.com"
					action="Continue"
					isError={ hasError }
				/>
				{ hasError && (
					<p className="select-newsletter-form__help is-error">Please enter a valid URL.</p>
				) }
				{ ! hasError && (
					<p className="select-newsletter-form__help">
						Enter the URL of the substack newsletter that you wish to import.
					</p>
				) }
			</div>
		</Card>
	);
}
