import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SectionHeading } from '../shared/section-heading';
import { TumblrLinkPreview } from './link-preview';
import { TumblrPostPreview } from './post-preview';
import { TumblrPreviewProps } from './types';

export const TumblrFullPreview: React.FC< TumblrPreviewProps > = ( props ) => {
	return (
		<div className="social-preview tumblr-preview">
			<section className="social-preview__section tumblr-preview__section">
				<SectionHeading level={ props.headingsLevel }>
					{
						// translators: refers to a social post on Tumblr
						__( 'Your post', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __( 'This is what your social post will look like on Tumblr:', 'social-previews' ) }
				</p>
				<TumblrPostPreview { ...props } />
			</section>
			<section className="social-preview__section tumblr-preview__section">
				<SectionHeading level={ props.headingsLevel }>
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
					&nbsp;
					<ExternalLink href="https://jetpack.com/support/jetpack-social-image-generator">
						{ __( 'Learn more about links', 'social-previews' ) }
					</ExternalLink>
				</p>
				<TumblrLinkPreview { ...props } />
			</section>
		</div>
	);
};
