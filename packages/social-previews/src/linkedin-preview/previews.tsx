import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import { LinkedInLinkPreview } from './link-preview';
import { LinkedInPostPreview } from './post-preview';
import type { LinkedInPreviewsProps } from './types';

export const LinkedInPreviews: React.FC< LinkedInPreviewsProps > = ( {
	headingLevel,
	hideLinkPreview,
	hidePostPreview,
	...props
} ) => {
	return (
		<div className="social-preview linkedin-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section linkedin-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on LinkedIn
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __( 'This is what your social post will look like on LinkedIn:', 'social-previews' ) }
					</p>
					<LinkedInPostPreview { ...props } />
				</section>
			) }
			{ ! hideLinkPreview && (
				<section className="social-preview__section linkedin-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a link to a LinkedIn post
							__( 'Link preview', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __(
							'This is what it will look like when someone shares the link to your WordPress post on LinkedIn.',
							'social-previews'
						) }
					</p>
					<LinkedInLinkPreview { ...props } name="" profileImage="" />
				</section>
			) }
		</div>
	);
};
