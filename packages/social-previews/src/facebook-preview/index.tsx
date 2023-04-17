import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import FacebookLinkPreview from './link-preview';
import FacebookPostPreview from './post-preview';
import type { FacebookPreviewProps } from './types';

import './style.scss';

const FacebookPreview: React.FC< FacebookPreviewProps > = ( props ) => {
	const { customImage } = props;
	const isPostPreview = !! customImage;

	return (
		<div className="social-preview facebook-preview">
			<section className="social-preview__section facebook-preview__section">
				<SectionHeading level={ props.headingsLevel }>
					{
						// translators: refers to a social post on Facebook
						__( 'Your post', 'facebook-preview' )
					}
				</SectionHeading>
				<p className="social-preview__section-desc">
					{ __( 'This is what your social post will look like on Facebook:', 'facebook-preview' ) }
				</p>
				{ isPostPreview ? (
					<FacebookPostPreview { ...props } />
				) : (
					<FacebookLinkPreview { ...props } />
				) }
			</section>
		</div>
	);
};

export default FacebookPreview;
