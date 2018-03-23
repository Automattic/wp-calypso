/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import SectionHeader from 'components/section-header';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import RelatedContentPreview from './related-content-preview';

const RelatedPosts = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	translate,
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Related Posts' ) } />

			<Card className="related-posts__card site-settings__traffic-settings">
				<FormFieldset>
					<div className="related-posts__info site-settings__info-link-container">
						<InfoPopover position="left">
							{ translate( 'Automatically displays similar content at the end of each post.' ) }{' '}
							<ExternalLink
								href="https://jetpack.com/support/related-posts/"
								icon={ false }
								target="_blank"
							>
								{ translate( 'Learn more' ) }
							</ExternalLink>
						</InfoPopover>
					</div>

					<CompactFormToggle
						checked={ !! fields.jetpack_relatedposts_enabled }
						disabled={ isRequestingSettings || isSavingSettings }
						onChange={ handleAutosavingToggle( 'jetpack_relatedposts_enabled' ) }
					>
						{ translate( 'Show related content after posts' ) }
					</CompactFormToggle>

					<div className="related-posts__module-settings site-settings__child-settings">
						<CompactFormToggle
							checked={ !! fields.jetpack_relatedposts_show_headline }
							disabled={
								isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
							}
							onChange={ handleAutosavingToggle( 'jetpack_relatedposts_show_headline' ) }
						>
							{ translate(
								'Show a "Related" header to more clearly separate the related section from posts'
							) }
						</CompactFormToggle>

						<CompactFormToggle
							checked={ !! fields.jetpack_relatedposts_show_thumbnails }
							disabled={
								isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
							}
							onChange={ handleAutosavingToggle( 'jetpack_relatedposts_show_thumbnails' ) }
						>
							{ translate( 'Use a large and visually striking layout' ) }
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
