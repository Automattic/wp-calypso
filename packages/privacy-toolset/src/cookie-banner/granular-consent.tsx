import { FormToggle } from '@wordpress/components';
import { ChangeEvent, useCallback } from 'react';
import type { GranularConsentContent } from './types';

type Props = {
	content: GranularConsentContent;
	onChange: ( checked: boolean ) => void;
	checked: boolean;
	disabled?: boolean;
};

export const GranularConsent = ( {
	content: { name, description },
	disabled,
	checked,
	onChange,
}: Props ) => {
	const handleChange = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
			onChange( event.target.checked );
		},
		[ onChange ]
	);
	return (
		<div className="cookie-banner__bucket-container">
			<FormToggle onChange={ handleChange } checked={ checked } disabled={ disabled } />
			<div className="cookie-banner__option-description">
				<strong>{ name }</strong>
				<p>{ description }</p>
			</div>
		</div>
	);
};
