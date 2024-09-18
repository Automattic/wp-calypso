import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';
import { EngineTypes } from './types';

interface SelectNewsletterFormProps {
	redirectUrl: string;
	urlData?: UrlData;
	isLoading: boolean;
	engine: EngineTypes;
	value: string;
	urlError: boolean;
}

export default function SelectNewsletterForm( {
	redirectUrl,
	urlData,
	isLoading,
	engine,
	value,
	urlError,
}: SelectNewsletterFormProps ) {
	const [ isUrlInvalid, setIsUrlInvalid ] = useState( false );

	const handleAction = ( fromSite: string ) => {
		if ( ! isValidUrl( fromSite ) ) {
			setIsUrlInvalid( true );
			return;
		}

		const { hostname } = parseUrl( fromSite );
		page( addQueryArgs( redirectUrl, { from: hostname } ) );
	};

	if ( isLoading ) {
		return (
			<Card className="select-newsletter-form">
				<div className="is-loading" />
			</Card>
		);
	}

	const isError = isUrlInvalid || urlError || ( urlData?.platform && urlData.platform !== engine );

	return (
		<Card className="select-newsletter-form">
			<FormTextInputWithAction
				onAction={ handleAction }
				placeholder="https://example.substack.com"
				action="Continue"
				isError={ isError }
				defaultValue={ value }
			/>
			{ isError && (
				<p className="select-newsletter-form__help is-error">Please enter a valid Substack URL.</p>
			) }
			{ ! isError && (
				<p className="select-newsletter-form__help">
					Enter the URL of the Substack newsletter that you wish to import.
				</p>
			) }
		</Card>
	);
}
