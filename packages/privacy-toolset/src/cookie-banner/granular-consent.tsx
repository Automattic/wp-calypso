import { ChangeEvent, useCallback } from 'react';
import type { Buckets, GranularConsentContent } from './types';

type Props = {
	name: keyof Buckets;
	content: GranularConsentContent;
	onChange: ( checked: boolean ) => void;
	checked: boolean;
	disabled?: boolean;
};

export const GranularConsent = ( { name, content, disabled, checked, onChange }: Props ) => {
	const handleChange = useCallback(
		( event: ChangeEvent< HTMLInputElement > ) => {
			onChange( event.target.checked );
		},
		[ onChange ]
	);
	return (
		<div className="cookie-banner__bucket-container">
			<div className="cookie-banner__checkbox-container">
				<input
					type="checkbox"
					id={ name }
					checked={ checked }
					onChange={ handleChange }
					disabled={ disabled }
				/>
			</div>
			<div className="cookie-banner__option-description">
				<strong>{ content.name }</strong>
				<p>{ content.description }</p>
			</div>
		</div>
	);
};
