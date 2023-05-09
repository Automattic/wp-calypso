import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import DefaultFacebookLinkPreview from './default-link-preview';
import DefaultFacebookPostPreview from './default-post-preview';
import FacebookLinkPreview from './link-preview';
import FacebookPostPreview from './post-preview';
import type { FacebookPreviewProps } from './types';

import './style.scss';

export const FacebookPreview: React.FC< FacebookPreviewProps > = ( props ) => {
	const { customImage } = props;
	const isPostPreview = !! customImage;

	return (
		<div className="social-preview facebook-preview">
			<section className="social-preview__section facebook-preview__section">
				<SectionHeading level={ props.headingsLevel }>
					{
						// translators: refers to a social post on Facebook
						__( 'Your post', 'social-previews' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __( 'This is what your social post will look like on Facebook:', 'social-previews' ) }
				</p>
				{ isPostPreview ? (
					<FacebookPostPreview { ...props } />
				) : (
					<FacebookLinkPreview { ...props } />
				) }
			</section>
			<section className="social-preview__section facebook-preview__section">
				<SectionHeading level={ props.headingsLevel }>
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
				{ isPostPreview ? (
					<DefaultFacebookPostPreview { ...props } />
				) : (
					<DefaultFacebookLinkPreview { ...props } />
				) }
			</section>
		</div>
	);
};

export { default as FacebookDefaultLinkPreview } from './default-link-preview';
export { default as FacebookDefaultPostPreview } from './default-post-preview';
export { default as FacebookFullPreview } from './full-preview';
export { default as FacebookLinkPreview } from './link-preview';
export { default as FacebookPostPreview } from './post-preview';
