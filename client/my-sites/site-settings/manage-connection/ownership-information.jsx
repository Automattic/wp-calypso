import { Gridicon } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

const OwnershipInformation = () => {
	const { __ } = useI18n();
	const strongElement = { strong: <strong /> };

	return (
		<FormFieldset className="manage-connection__formfieldset has-divider is-top-only">
			<div className="manage-connection__ownership-info">
				<Gridicon
					icon="info-outline"
					size={ 24 }
					className="manage-connection__ownership-info-icon"
				/>

				<div className="manage-connection__ownership-info-text">
					<FormSettingExplanation>
						{ createInterpolateElement(
							__(
								'<strong>Site owners</strong> are users who have connected Jetpack to WordPress.com.'
							),
							strongElement
						) }
						<br />
						{ createInterpolateElement(
							__(
								'<strong>Plan purchasers</strong> are users who purchased a paid plan for the site.'
							),
							strongElement
						) }
					</FormSettingExplanation>
					<FormSettingExplanation>
						{ __(
							'Usually these are the same person, but sometimes they can differ. E.g., developers may be ' +
								'a Site owner, because they set up the website and connected Jetpack to WordPress.com and ' +
								'their clients may be Plan purchasers who use their billing information to purchase the plan ' +
								'for the site.'
						) }
					</FormSettingExplanation>
				</div>
			</div>
		</FormFieldset>
	);
};

export default OwnershipInformation;
