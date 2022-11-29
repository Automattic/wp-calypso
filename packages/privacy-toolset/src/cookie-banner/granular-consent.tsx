import { FormToggle } from '@wordpress/components';
import { ChangeEvent, useCallback } from 'react';
import type { GranularConsentContent } from './types';

type Props = {
	name: string;
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
			<FormToggle
				onChange={ handleChange }
				checked={ checked }
				disabled={ disabled }
				data-testid={ `${ name }-bucket-toggle` }
			/>
			<div className="cookie-banner__option-description">
				<strong>{ content.name }</strong>
				<p>{ content.description }</p>
			</div>
		</div>
	);
};
