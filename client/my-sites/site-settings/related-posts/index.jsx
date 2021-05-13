/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormToggle from 'calypso/components/forms/form-toggle';
import SupportInfo from 'calypso/components/support-info';
import RelatedContentPreview from './related-content-preview';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

/**
 * Style dependencies
 */
import './style.scss';

const RelatedPosts = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	translate,
} ) => {
	return (
		<div>
			<SettingsSectionHeader title={ translate( 'Related posts' ) } />

			<Card className="related-posts__card site-settings__traffic-settings">
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'The feature helps visitors find more of your content by displaying related posts at the bottom of each post.'
						) }
						link="https://jetpack.com/support/related-posts/"
					/>

					<FormToggle
						checked={ !! fields.jetpack_relatedposts_enabled }
						disabled={ isRequestingSettings || isSavingSettings }
						onChange={ handleAutosavingToggle( 'jetpack_relatedposts_enabled' ) }
					>
						{ translate( 'Show related content after posts' ) }
					</FormToggle>

					<div className="related-posts__module-settings site-settings__child-settings">
						<FormToggle
							checked={ !! fields.jetpack_relatedposts_show_headline }
							disabled={
								isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
							}
							onChange={ handleAutosavingToggle( 'jetpack_relatedposts_show_headline' ) }
						>
							{ translate( 'Highlight related content with a heading' ) }
						</FormToggle>

						<FormToggle
							checked={ !! fields.jetpack_relatedposts_show_thumbnails }
							disabled={
								isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
							}
							onChange={ handleAutosavingToggle( 'jetpack_relatedposts_show_thumbnails' ) }
						>
							{ translate( 'Show a thumbnail image where available' ) }
						</FormToggle>
					</div>

					<FormSettingExplanation>
						{ translate(
							"These settings won't apply to {{a}}related posts added using the block editor{{/a}}.",
							{
								components: {
									a: (
										<a
											href="https://jetpack.com/support/jetpack-blocks/related-posts-block/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</FormSettingExplanation>

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
	fields: {},
};

RelatedPosts.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	handleAutosavingToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default localize( RelatedPosts );
