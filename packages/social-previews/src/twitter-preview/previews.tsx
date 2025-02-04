import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import { TwitterLinkPreview } from './link-preview';
import { TwitterPostPreview } from './post-preview';
import type { TwitterPreviewsProps } from './types';

export const TwitterPreviews: React.FC< TwitterPreviewsProps > = ( {
	headingLevel,
	hideLinkPreview,
	hidePostPreview,
	tweets,
} ) => {
	if ( ! tweets?.length ) {
		return null;
	}

	return (
		<div className="social-preview twitter-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section twitter-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on Twitter
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __( 'This is what your social post will look like on X:', 'social-previews' ) }
					</p>
					{ tweets.map( ( tweet, index ) => {
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
			) }
			{ ! hideLinkPreview && (
				<section className="social-preview__section twitter-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a link to a Twitter post
							__( 'Link preview', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __(
							'This is what it will look like when someone shares the link to your WordPress post on X.',
							'social-previews'
						) }
					</p>
					<TwitterLinkPreview { ...tweets[ 0 ] } name="" profileImage="" screenName="" />
				</section>
			) }
		</div>
	);
};
