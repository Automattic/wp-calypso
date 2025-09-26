import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { useState } from 'react';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';

interface SelectNewsletterFormProps {
	value: string;
	setFromSite: ( fromSite: string ) => void;
	isError: boolean;
	siteId: number;
	engine: string;
	siteSlug: string;
}

export default function SelectNewsletterForm( {
	value,
	isError,
	setFromSite,
	engine,
	siteSlug,
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
		const stepUrl = `/import/newsletter/${ engine }/${ siteSlug }/content`;

		setFromSite( from );
		page( stepUrl );
	};

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
					{ i18n.translate(
						"Enter your Substack URL. We'll create a link where you can download your newsletter content."
					) }
				</p>
			) }
		</Card>
	);
}
