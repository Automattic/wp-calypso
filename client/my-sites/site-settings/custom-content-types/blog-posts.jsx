import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';

function BlogPosts( { fields, translate, onChangeField, isDisabled } ) {
	const name = 'post';

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
									name={ name }
									type="number"
									step="1"
									min="0"
									aria-labelledby={ name }
									value={ 'undefined' === typeof fields[ name ] ? 10 : fields[ name ] }
									onChange={ onChangeField( name ) }
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
