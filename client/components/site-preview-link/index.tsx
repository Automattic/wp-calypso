import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import ClipboardButtonInput from '../clipboard-button-input';

export default function SitePreviewLink( { disabled = false } ) {
	const translate = useTranslate();
	const [ checked, setChecked ] = useState( false );
	const [ loading ] = useState( false );
	function onChange( value: boolean ) {
		setChecked( value );
	}
	const checkedAndNotDisabled = checked && ! disabled;
	return (
		<div>
			<ToggleControl
				label={ translate( 'Create a preview link.' ) }
				checked={ checkedAndNotDisabled }
				onChange={ onChange }
				{ ...{ disabled: disabled || loading } } // disabled is not included on ToggleControl props type
			/>
			<FormSettingExplanation>
				{ translate( 'Anyone with this link can view your site.' ) }
			</FormSettingExplanation>
			{ checkedAndNotDisabled && (
				<ClipboardButtonInput
					value="https://mysite.wordpress.com?preview=12kabe45cdp"
					hideHttp
					disabled={ loading }
				/>
			) }
		</div>
	);
}
