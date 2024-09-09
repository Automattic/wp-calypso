import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';

type Props = {
	stepUrl: string;
	urlData?: UrlData;
	isLoading: boolean;
};

export default function SelectNewsletterForm( { stepUrl, urlData, isLoading }: Props ) {
	const [ hasError, setHasError ] = useState( false );

	const handleAction = ( fromSite: string ) => {
		if ( ! isValidUrl( fromSite ) ) {
			setHasError( true );
			return;
		}

		const { hostname } = parseUrl( fromSite );
		page( addQueryArgs( stepUrl, { from: hostname } ) );
		return;
	};

	if ( isLoading ) {
		return (
			<Card className="select-newsletter-form">
				<div className="is-loading" />
			</Card>
		);
	}

	return (
		<Card className="select-newsletter-form">
			<FormTextInputWithAction
				onAction={ handleAction }
				placeholder="https://example.substack.com"
				action="Continue"
				isError={ hasError }
				defaultValue={ urlData?.url }
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
