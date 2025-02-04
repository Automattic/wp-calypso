import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

export const BLOG_PAGES_OPTION = 'posts_per_page';

type BlogPagesSettingProps = {
	value?: number;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	disabled?: boolean;
};

export const BlogPagesSetting = ( { value = 10, onChange, disabled }: BlogPagesSettingProps ) => {
	const translate = useTranslate();
	return (
		<FormFieldset>
			<FormLabel
				id={ `${ BLOG_PAGES_OPTION }-label` }
				htmlFor={ BLOG_PAGES_OPTION }
				className="reduce-margin-bottom-fix"
			>
				{ translate( 'Blog pages' ) }
			</FormLabel>
			<div>
				{ translate( 'Show at most {{field /}} posts', {
					comment:
						'The field value is a number that defines how many posts are shown on the posts, or the archive, page at a time.',
					components: {
						field: (
							<FormTextInput
								id={ BLOG_PAGES_OPTION }
								name={ BLOG_PAGES_OPTION }
								type="number"
								step="1"
								min="0"
								aria-labelledby={ `${ BLOG_PAGES_OPTION }-label` }
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
					'The number of posts displayed on your selected posts page. Displaying 10 or less can improve usability, SEO, and page speed. May not apply to themes with infinite scrolling.'
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
