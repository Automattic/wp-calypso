/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import RelatedContentPreview from './related-content-preview';

const RelatedPosts = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	onSubmitForm,
	translate
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Related Posts' ) }>
				<Button
					compact={ true }
					onClick={ onSubmitForm }
					primary={ true }
					type="submit"
					disabled={ isRequestingSettings || isSavingSettings }>
						{ isSavingSettings
							? translate( 'Saving…' )
							: translate( 'Save Settings' )
						}
				</Button>
			</SectionHeader>

			<Card className="related-posts__card site-settings">
				<FormFieldset>
					<CompactFormToggle
						checked={ !! fields.jetpack_relatedposts_enabled }
						disabled={ isRequestingSettings }
						onChange={ handleToggle( 'jetpack_relatedposts_enabled' ) }
					>
						{ translate( 'Show related content after posts' ) }
					</CompactFormToggle>

					<div className="related-posts__module-settings site-settings__child-settings">
						<CompactFormToggle
							checked={ !! fields.jetpack_relatedposts_show_headline }
							disabled={ isRequestingSettings || ! fields.jetpack_relatedposts_enabled }
							onChange={ handleToggle( 'jetpack_relatedposts_show_headline' ) }
						>
							{ translate(
								'Show a "Related" header to more clearly separate the related section from posts'
							) }
						</CompactFormToggle>

						<CompactFormToggle
							checked={ !! fields.jetpack_relatedposts_show_thumbnails }
							disabled={ isRequestingSettings || ! fields.jetpack_relatedposts_enabled }
							onChange={ handleToggle( 'jetpack_relatedposts_show_thumbnails' ) }
						>
							{ translate(
								'Use a large and visually striking layout'
							) }
						</CompactFormToggle>
					</div>

					<RelatedContentPreview
						showHeadline={ fields.jetpack_relatedposts_show_headline }
						showThumbnails={ fields.jetpack_relatedposts_show_thumbnails }
					/>
				</FormFieldset>
			</Card>
		</div>
	);
};

RelatedPosts.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

RelatedPosts.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default localize( RelatedPosts );
