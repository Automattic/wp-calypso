import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

export default function PublishConfirmation() {
	const translate = useTranslate();

	return (
		<FormFieldset>
			<FormLabel>{ translate( 'Show publish confirmation' ) }</FormLabel>
			<FormSettingExplanation>
				{ translate(
					'The Block Editor handles the Publish confirmation setting. ' +
						'To enable it, go to Options under the Ellipsis menu in the Editor ' +
						'and check "Enable Pre-publish checks."'
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
}
