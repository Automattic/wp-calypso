import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import { NextdoorLinkPreview } from './link-preview';
import { NextdoorPostPreview } from './post-preview';
import type { NextdoorPreviewsProps } from './types';

export const NextdoorPreviews: React.FC< NextdoorPreviewsProps > = ( {
	headingLevel,
	hideLinkPreview,
	hidePostPreview,
	...props
} ) => {
	return (
		<div className="social-preview nextdoor-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section nextdoor-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on Nextdoor
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __( 'This is what your social post will look like on Nextdoor:', 'social-previews' ) }
					</p>
					<NextdoorPostPreview { ...props } />
				</section>
			) }
			{ ! hideLinkPreview && (
				<section className="social-preview__section nextdoor-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a link to a Nextdoor post
							__( 'Link preview', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __(
							'This is what it will look like when someone shares the link to your WordPress post on Nextdoor.',
							'social-previews'
						) }
					</p>
					<NextdoorLinkPreview { ...props } name="" profileImage="" />
				</section>
			) }
		</div>
	);
};
