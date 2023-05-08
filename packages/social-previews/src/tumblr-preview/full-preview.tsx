import { __ } from '@wordpress/i18n';
import { SectionHeading } from '../shared/section-heading';
import TumblrLinkPreview from './link-preview';
import { TumblrPreviewProps } from './types';

const TumblrFullPreview: React.FC< TumblrPreviewProps > = ( props ) => {
	return (
		<div className="social-preview tumblr-preview">
			<section className="social-preview__section tumblr-preview__section">
				<SectionHeading level={ props.headingsLevel }>
					{
						// translators: refers to a social post on Tumblr
						__( 'Your post', 'tumblr-preview' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __( 'This is what your social post will look like on Tumblr:', 'tumblr-preview' ) }
				</p>
				<TumblrLinkPreview { ...props } />
			</section>
		</div>
	);
};

export default TumblrFullPreview;
