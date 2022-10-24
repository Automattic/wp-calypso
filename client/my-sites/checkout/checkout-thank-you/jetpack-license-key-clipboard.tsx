import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';

export interface JetpackLicenseKeyClipboardProps {
	copied: boolean;
	disabled: boolean;
	licenseKey: string;
	loading: boolean;
	onCopy?: () => void;
}

const JetpackLicenseKeyClipboard: React.FC< JetpackLicenseKeyClipboardProps > = ( {
	copied,
	disabled,
	licenseKey,
	loading,
	onCopy,
} ) => {
	const translate = useTranslate();

	return (
		<>
			<div className="jetpack-license-key-clipboard">
				<label>
					<strong>{ translate( 'Your license key' ) }</strong>
				</label>
				<div className="jetpack-license-key-clipboard__container">
					<FormTextInput
						className={ classnames( 'jetpack-license-key-clipboard__input', {
							'is-loading': loading,
						} ) }
						value={ licenseKey }
						readOnly
					/>
					<ClipboardButton
						className="jetpack-license-key-clipboard__button"
						text={ licenseKey }
						onCopy={ onCopy }
						compact
						primary
						disabled={ disabled || loading }
					>
						{ copied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
					</ClipboardButton>
				</div>
			</div>
		</>
	);
};

export default JetpackLicenseKeyClipboard;
