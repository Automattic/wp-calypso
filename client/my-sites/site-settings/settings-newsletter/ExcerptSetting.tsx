import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';

type ExcerptSettingProps = {
	value?: boolean;
	disabled?: boolean;
	updateFields?: ( fields: { [ key: string ]: unknown } ) => void;
};

export const ExcerptSetting = ( {
	value = false,
	disabled,
	updateFields,
}: ExcerptSettingProps ) => {
	const translate = useTranslate();
	return (
		<FormFieldset>
			<FormLabel className="increase-margin-bottom-fix">
				{ translate( 'For each new post email, include' ) }
			</FormLabel>
			<FormLabel>
				<FormRadio
					checked={ ! value }
					onChange={ () => updateFields?.( { wpcom_subscription_emails_use_excerpt: false } ) }
					disabled={ disabled }
					label={ translate( 'Full text' ) }
				/>
			</FormLabel>
			<FormLabel>
				<FormRadio
					checked={ value }
					onChange={ () => updateFields?.( { wpcom_subscription_emails_use_excerpt: true } ) }
					disabled={ disabled }
					label={ translate( 'Excerpt' ) }
				/>
			</FormLabel>
			<FormSettingExplanation>
				{ translate(
					'Sets whether email subscribers can read full posts in emails or just an excerpt and link to the full version of the post. {{link}}Learn more about sending emails{{/link}}.',
					{
						components: {
							link: (
								<InlineSupportLink
									showIcon={ false }
									supportContext="subscriptions-and-newsletters"
								/>
							),
						},
					}
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
