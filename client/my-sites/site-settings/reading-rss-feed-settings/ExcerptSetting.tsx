import { FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

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
				{ translate( 'For each post in a feed, include' ) }
			</FormLabel>
			<FormLabel>
				<FormRadio
					checked={ ! value }
					onChange={ () => updateFields?.( { rss_use_excerpt: false } ) }
					disabled={ disabled }
					label={ translate( 'Full text' ) }
				/>
			</FormLabel>
			<FormLabel>
				<FormRadio
					checked={ value }
					onChange={ () => updateFields?.( { rss_use_excerpt: true } ) }
					disabled={ disabled }
					label={ translate( 'Excerpt' ) }
				/>
			</FormLabel>
			<FormSettingExplanation>
				{ translate(
					'Sets whether RSS subscribers can read full posts in their RSS reader, or just an excerpt and link to the full version on your site. {{link}}Learn more about feeds{{/link}}.',
					{
						components: {
							link: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/feeds/' ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
