import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

export const SYNDICATION_FEEDS_OPTION = 'posts_per_rss';

type SyndicationFeedsSettingProps = {
	value?: number;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	disabled?: boolean;
};

export const SyndicationFeedsSetting = ( {
	value = 10,
	onChange,
	disabled,
}: SyndicationFeedsSettingProps ) => {
	const translate = useTranslate();
	return (
		<FormFieldset>
			<FormLabel id={ `${ SYNDICATION_FEEDS_OPTION }-label` } htmlFor={ SYNDICATION_FEEDS_OPTION }>
				{ translate( 'Syndication feeds' ) }
			</FormLabel>
			<div>
				{ translate( 'Show the most recent {{field /}} items', {
					comment:
						'The field value is a number that defines how many posts are shown on the posts, or the archive, page at a time.',
					components: {
						field: (
							<FormTextInput
								id={ SYNDICATION_FEEDS_OPTION }
								name={ SYNDICATION_FEEDS_OPTION }
								type="number"
								step="1"
								min="0"
								aria-labelledby={ `${ SYNDICATION_FEEDS_OPTION }-label` }
								value={ value }
								onChange={ onChange }
								disabled={ disabled }
							/>
						),
					},
				} ) }
			</div>
			<FormSettingExplanation>
				{ translate(
					'Sets the number of your most recent posts that will be sent out at once to RSS feed subscribers. (Located at https://example.wordpress.com/feed/).'
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
