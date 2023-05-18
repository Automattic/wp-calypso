import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import { SocialPreviewsBaseProps } from '../types';
import { FacebookLinkPreview } from './link-preview';
import { LinkPreviewDetails } from './link-preview-details';
import { FacebookPostPreview } from './post-preview';
import type { FacebookPreviewProps } from './types';

export type FacebookPreviewsProps = FacebookPreviewProps & SocialPreviewsBaseProps;

export const FacebookPreviews: React.FC< FacebookPreviewsProps > = ( props ) => {
	const hasMedia = !! props.media?.length;
	const hasCustomImage = !! props.customImage;

	return (
		<div className="social-preview facebook-preview">
			<section className="social-preview__section facebook-preview__section">
				<SectionHeading level={ props.headingLevel }>
					{
						// translators: refers to a social post on Facebook
						__( 'Your post', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __( 'This is what your social post will look like on Facebook:', 'social-previews' ) }
				</p>
				{ hasMedia ? <FacebookPostPreview { ...props } /> : <FacebookLinkPreview { ...props } /> }
			</section>
			<section className="social-preview__section facebook-preview__section">
				<SectionHeading level={ props.headingLevel }>
					{
						// translators: refers to a link to a Facebook post
						__( 'Link preview', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __(
						'This is what it will look like when someone shares the link to your WordPress post on Facebook.',
						'social-previews'
					) }
					&nbsp;
					<ExternalLink href="https://jetpack.com/support/jetpack-social-image-generator">
						{ __( 'Learn more about links', 'social-previews' ) }
					</ExternalLink>
				</p>
				{ hasCustomImage ? (
					<LinkPreviewDetails { ...props } />
				) : (
					<FacebookLinkPreview { ...props } compactDescription customText="" user={ undefined } />
				) }
			</section>
		</div>
	);
};
