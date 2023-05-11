import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import { TwitterLinkPreview } from './link-preview';
import { TwitterPostPreview } from './post-preview';
import type { TwitterPreviewsProps } from './types';

export const TwitterPreviews: React.FC< TwitterPreviewsProps > = ( { tweets, headingLevel } ) => {
	return (
		<div className="social-preview twitter-preview">
			<section className="social-preview__section twitter-preview__section">
				<SectionHeading level={ headingLevel }>
					{
						// translators: refers to a social post on Twitter
						__( 'Your post', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __( 'This is what your social post will look like on Twitter:', 'social-previews' ) }
				</p>
				{ tweets?.map( ( tweet, index ) => {
					const isLast = index + 1 === tweets.length;
					return (
						<TwitterPostPreview
							key={ `twitter-preview__tweet-${ index }` }
							{ ...tweet }
							showThreadConnector={ ! isLast }
						/>
					);
				} ) }
			</section>
			<section className="social-preview__section twitter-preview__section">
				<SectionHeading level={ headingLevel }>
					{
						// translators: refers to a link to a Twitter post
						__( 'Link preview', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __(
						'This is what it will look like when someone shares the link to your WordPress post on Twitter.',
						'social-previews'
					) }
					&nbsp;
					<ExternalLink href="https://jetpack.com/support/jetpack-social-image-generator">
						{ __( 'Learn more about links', 'social-previews' ) }
					</ExternalLink>
				</p>
				<TwitterLinkPreview { ...tweets[ 0 ] } />
			</section>
		</div>
	);
};
