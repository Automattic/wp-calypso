import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import { InstagramPostPreview } from './post-preview';
import type { InstagramPreviewsProps } from './types';

export const InstagramPreviews: React.FC< InstagramPreviewsProps > = ( {
	headingLevel,
	hidePostPreview,
	...props
} ) => {
	return (
		<div className="social-preview instagram-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section instagram-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on Instagram
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __(
							'This is what your social post will look like on Instagram:',
							'social-previews'
						) }
					</p>
					<InstagramPostPreview { ...props } />
				</section>
			) }
		</div>
	);
};
