import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';

interface SelectNewsletterFormProps {
	redirectUrl: string;
	value: string;
	isLoading: boolean;
	isError: boolean;
}

export default function SelectNewsletterForm( {
	redirectUrl,
	value,
	isLoading,
	isError,
}: SelectNewsletterFormProps ) {
	const [ isUrlInvalid, setIsUrlInvalid ] = useState( false );

	const handleAction = ( fromSite: string ) => {
		if ( ! isValidUrl( fromSite ) ) {
			setIsUrlInvalid( true );
			return;
		}

		const { hostname, pathname } = parseUrl( fromSite );
		const from = pathname.match( /^\/@\w+$/ ) ? hostname + pathname : hostname;

		page( addQueryArgs( redirectUrl, { from } ) );
	};

	if ( isLoading ) {
		return (
			<Card className="select-newsletter-form">
				<div className="is-loading" />
			</Card>
		);
	}

	const hasError = isUrlInvalid || isError;

	return (
		<Card className="select-newsletter-form">
			<FormTextInputWithAction
				onAction={ handleAction }
				placeholder="https://example.substack.com"
				action="Continue"
				isError={ hasError }
				defaultValue={ value }
			/>
			{ hasError && (
				<p className="select-newsletter-form__help is-error">Please enter a valid Substack URL.</p>
			) }
			{ ! hasError && (
				<p className="select-newsletter-form__help">
					Enter the URL of the Substack newsletter that you wish to import.
				</p>
			) }
		</Card>
	);
}
