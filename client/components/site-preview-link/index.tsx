import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

export default function SitePreviewLink( { disabled = false } ) {
	const translate = useTranslate();
	const [ checked, setChecked ] = useState( false );
	function onChange( value: boolean ) {
		setChecked( value );
	}
	return (
		<div>
			<ToggleControl
				label={ translate( 'Create a preview link.' ) }
				checked={ checked }
				onChange={ onChange }
				{ ...{ disabled } } // disabled is not included on ToggleControl props type
			/>
			<FormSettingExplanation>
				{ translate( 'Anyone with this link can view your site.' ) }
			</FormSettingExplanation>
		</div>
	);
}
