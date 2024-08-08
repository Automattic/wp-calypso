import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import { isValidUrl, parseUrl } from 'calypso/lib/importer/url-validation';

type Props = {
	stepUrl: string;
	urlData?: UrlData;
	isLoading: boolean;
	validFromSite: boolean;
};
export default function SelectNewsletterForm( {
	stepUrl,
	urlData,
	isLoading,
	validFromSite,
}: Props ) {
	const [ hasError, setHasError ] = useState( ! validFromSite );

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
			<Card>
				<div className="select-newsletter-form">
					<p className="is-loading"></p>
				</div>
			</Card>
		);
	}

	return (
		<Card>
			<div className="select-newsletter-form">
				<FormTextInputWithAction
					onAction={ handleAction }
					placeholder="https://example.substack.com"
					action="Continue"
					isError={ hasError }
					defaultValue={ urlData?.url }
				/>
				{ hasError && (
					<p className="select-newsletter-form__help is-error">
						Please enter a valid substack URL.
					</p>
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
