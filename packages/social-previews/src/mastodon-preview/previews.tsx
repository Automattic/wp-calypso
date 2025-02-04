import { __ } from '@wordpress/i18n';
import { SectionHeading } from '../shared/section-heading';
import { SocialPreviewsBaseProps } from '../types';
import { MastodonLinkPreview } from './link-preview';
import { MastodonPostPreview } from './post-preview';
import { MastodonPreviewProps } from './types';

export type MastodonPreviewsProps = MastodonPreviewProps & SocialPreviewsBaseProps;

export const MastodonPreviews: React.FC< MastodonPreviewsProps > = ( {
	headingLevel,
	hidePostPreview,
	hideLinkPreview,
	...props
} ) => {
	return (
		<div className="social-preview mastodon-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section mastodon-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on Mastodon
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __( 'This is what your social post will look like on Mastodon:', 'social-previews' ) }
					</p>
					<MastodonPostPreview { ...props } />
				</section>
			) }
			{ ! hideLinkPreview && (
				<section className="social-preview__section mastodon-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a link to a Mastodon post
							__( 'Link preview', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __(
							'This is what it will look like when someone shares the link to your WordPress post on Mastodon.',
							'social-previews'
						) }
					</p>
					<MastodonLinkPreview { ...props } user={ undefined } />
				</section>
			) }
		</div>
	);
};
