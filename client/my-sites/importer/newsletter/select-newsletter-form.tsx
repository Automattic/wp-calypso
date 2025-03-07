import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
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
	const { __ } = useI18n();
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
				action={ __( 'Continue' ) }
				isError={ hasError }
				defaultValue={ value }
			/>
			{ hasError && (
				<p className="select-newsletter-form__help is-error">
					{ __( 'Please enter a valid Substack URL.' ) }
				</p>
			) }
			{ ! hasError && (
				<p className="select-newsletter-form__help">
					{ i18n.fixMe( {
						text: "Enter your Substack URL. We'll create a link where you can download your newsletter content.",
						newCopy: i18n.translate(
							"Enter your Substack URL. We'll create a link where you can download your newsletter content."
						),
						oldCopy: i18n.translate(
							'Enter the URL of the Substack newsletter that you wish to import.'
						),
					} ) }
				</p>
			) }
		</Card>
	);
}
