import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

function BlogPosts( { fields, translate, onChangeField, isDisabled } ) {
	const name = 'post';
	const numberFieldIdentifier = 'posts_per_page';

	return (
		<FormFieldset>
			<div className="custom-content-types__module-settings">
				<div id={ name } className={ 'custom-content-types__label indented-form-field' }>
					{ translate( 'Blog posts' ) }
				</div>
				<div className="custom-content-types__indented-form-field indented-form-field">
					{ translate( 'Display {{field /}} per page', {
						comment:
							'The field value is a number that refers to site content type, e.g., blog post, testimonial or portfolio project',
						components: {
							field: (
								<FormTextInput
									name={ numberFieldIdentifier }
									type="number"
									step="1"
									min="0"
									aria-labelledby={ numberFieldIdentifier }
									value={
										'undefined' === typeof fields[ numberFieldIdentifier ]
											? 10
											: fields[ numberFieldIdentifier ]
									}
									onChange={ onChangeField( numberFieldIdentifier ) }
									disabled={ isDisabled }
								/>
							),
						},
					} ) }
				</div>
				<FormSettingExplanation isIndented>
					{ translate( 'On blog pages, the number of posts to show per page.' ) }
				</FormSettingExplanation>
			</div>
		</FormFieldset>
	);
}

export default BlogPosts;
