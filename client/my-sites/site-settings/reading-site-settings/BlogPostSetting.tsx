import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

export const BLOGS_POST_OPTION = 'posts_per_page';

type BlogsPostSettingProps = {
	value?: number;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	disabled?: boolean;
};

export const BlogsPostsSetting = ( { value = 10, onChange, disabled }: BlogsPostSettingProps ) => {
	const translate = useTranslate();
	return (
		<FormFieldset>
			<FormLabel id={ `${ BLOGS_POST_OPTION }-label` } htmlFor={ BLOGS_POST_OPTION }>
				{ translate( 'Blogs post' ) }
			</FormLabel>
			<div>
				{ translate( 'Show at most {{field /}} posts', {
					comment:
						'The field value is a number that defines how many posts are shown on the posts, or the archive, page at a time.',
					components: {
						field: (
							<FormTextInput
								id={ BLOGS_POST_OPTION }
								name={ BLOGS_POST_OPTION }
								type="number"
								step="1"
								min="0"
								aria-labelledby={ `${ BLOGS_POST_OPTION }-label` }
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
					'The number of posts displayed on your selected posts page. Displaying 10 or less can improve usability, SEO, and page speed.'
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
};
