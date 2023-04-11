import { __ } from '@wordpress/i18n';
import FacebookLinkPreview from './link-preview';
import type { FacebookPreviewProps } from './types';

import './style.scss';

const FacebookPreview: React.FC< FacebookPreviewProps > = ( props ) => {
	return (
		<div className="social-preview facebook-preview">
			<section className="social-preview__section facebook-preview__section">
				<h3 className="social-preview__section-heading">
					{
						// translators: refers to a social post on Facebook
						__( 'Your post' )
					}
				</h3>
				<p className="social-preview__section-desc">
					{ __( 'This is what your social post will look like on Facebook:' ) }
				</p>
				<FacebookLinkPreview { ...props } />
			</section>
		</div>
	);
};

export default FacebookPreview;
