import { __ } from '@wordpress/i18n';
import { SectionHeading } from '../shared/section-heading';
import { SocialPreviewsBaseProps } from '../types';
import { MastodonPostPreview } from './post-preview';
import { MastodonPreviewProps } from './types';

export type MastodonPreviewsProps = MastodonPreviewProps & SocialPreviewsBaseProps;

export const MastodonPreviews: React.FC< MastodonPreviewsProps > = ( props ) => {
	return (
		<div className="social-preview mastodon-preview">
			<section className="social-preview__section mastodon-preview__section">
				<SectionHeading level={ props.headingLevel }>
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
		</div>
	);
};
