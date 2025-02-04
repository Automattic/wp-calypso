import { __ } from '@wordpress/i18n';
import { SectionHeading } from '../shared/section-heading';
import { SocialPreviewsBaseProps } from '../types';
import { TumblrLinkPreview } from './link-preview';
import { TumblrPostPreview } from './post-preview';
import { TumblrPreviewProps } from './types';

export type TumblrPreviewsProps = TumblrPreviewProps & SocialPreviewsBaseProps;

export const TumblrPreviews: React.FC< TumblrPreviewsProps > = ( {
	headingLevel,
	hideLinkPreview,
	hidePostPreview,
	...props
} ) => {
	const hasMedia = !! props.media?.length;

	return (
		<div className="social-preview tumblr-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section tumblr-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on Tumblr
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __( 'This is what your social post will look like on Tumblr:', 'social-previews' ) }
					</p>
					{ hasMedia ? <TumblrPostPreview { ...props } /> : <TumblrLinkPreview { ...props } /> }
				</section>
			) }
			{ ! hideLinkPreview && (
				<section className="social-preview__section tumblr-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a link on Tumblr
							__( 'Link preview', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __(
							'This is what it will look like when someone shares the link to your WordPress post on Tumblr.',
							'social-previews'
						) }
					</p>
					<TumblrLinkPreview { ...props } user={ undefined } />
				</section>
			) }
		</div>
	);
};
