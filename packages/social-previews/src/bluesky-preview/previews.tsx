import { __ } from '@wordpress/i18n';
import { SectionHeading } from '../shared/section-heading';
import { SocialPreviewsBaseProps } from '../types';
import { BlueskyLinkPreview } from './link-preview';
import { BlueskyPostPreview } from './post-preview';
import { BlueskyPreviewProps } from './types';

export type BlueskyPreviewsProps = BlueskyPreviewProps & SocialPreviewsBaseProps;

export const BlueskyPreviews: React.FC< BlueskyPreviewsProps > = ( {
	headingLevel,
	hidePostPreview,
	hideLinkPreview,
	...props
} ) => {
	return (
		<div className="social-preview bluesky-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section bluesky-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on Bluesky
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __( 'This is what your social post will look like on Bluesky:', 'social-previews' ) }
					</p>
					<BlueskyPostPreview { ...props } />
				</section>
			) }
			{ ! hideLinkPreview && (
				<section className="social-preview__section bluesky-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a link to a Bluesky post
							__( 'Link preview', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __(
							'This is what it will look like when someone shares the link to your WordPress post on Bluesky.',
							'social-previews'
						) }
					</p>
					<BlueskyLinkPreview { ...props } />
				</section>
			) }
		</div>
	);
};
