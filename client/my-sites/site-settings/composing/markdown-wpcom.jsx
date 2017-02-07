/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle';

const MarkdownWpcom = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	translate
} ) => {
	return (
		<FormFieldset className="has-divider is-top-only">
			<FormLabel>
				{ translate( 'Markdown' ) }
			</FormLabel>
			<FormLabel>
				<FormToggle
					className="is-compact"
					name="wpcom_publish_posts_with_markdown"
					checked={ !! fields.wpcom_publish_posts_with_markdown }
					onChange={ handleToggle( 'wpcom_publish_posts_with_markdown' ) }
					disabled={ isRequestingSettings || isSavingSettings }
				>
					{
						translate( 'Use markdown for posts and pages. {{a}}Learn more about markdown{{/a}}.', {
							components: {
								a: (
									<a
										href="http://en.support.wordpress.com/markdown-quick-reference/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								)
							}
						} )
					}
				</FormToggle>
			</FormLabel>
		</FormFieldset>
	);
};

MarkdownWpcom.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

MarkdownWpcom.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default localize( MarkdownWpcom );
