import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

export const SYNDICATION_FEEDS_OPTION = 'posts_per_rss';

type SyndicationFeedsSettingProps = {
	value?: number;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	disabled?: boolean;
	siteUrl?: string;
};

export const SyndicationFeedsSetting = ( {
	value = 10,
	onChange,
	disabled,
	siteUrl,
}: SyndicationFeedsSettingProps ) => {
	const translate = useTranslate();
	const siteFeedUrl = siteUrl ? `${ siteUrl }/feed/` : '';
	return (
		<FormFieldset>
			<FormLabel
				id={ `${ SYNDICATION_FEEDS_OPTION }-label` }
				className="reduce-margin-bottom-fix"
				htmlFor={ SYNDICATION_FEEDS_OPTION }
			>
				{ translate( 'Syndication feeds' ) }
			</FormLabel>
			<div>
				{ translate( 'Show the most recent {{field /}} items', {
					comment:
						'The field value is a number of most recent posts that will be sent out at once to RSS feed subscribers.',
					components: {
						field: (
							<FormTextInput
								id={ SYNDICATION_FEEDS_OPTION }
								name={ SYNDICATION_FEEDS_OPTION }
								type="number"
								step="1"
								min="0"
								max="350"
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
					'Sets the number of your most recent posts that will be sent out at once to RSS feed subscribers. (Located at {{siteFeedLink /}}).',
					{
						comment: "The site feed link is a hyperlink to the user's site feed source.",
						components: {
							siteFeedLink: (
								<a href={ siteFeedUrl } target="_blank" rel="noreferrer">
									{ siteFeedUrl }
								</a>
							),
						},
					}
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
