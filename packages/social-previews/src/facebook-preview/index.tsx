import { useTranslate } from 'i18n-calypso';
import FacebookLinkPreview from './link-preview';
import type { FacebookPreviewProps } from './types';

import './style.scss';

const FacebookPreview: React.FC< FacebookPreviewProps > = ( props ) => {
	const translate = useTranslate();

	return (
		<div className="social-preview facebook-preview">
			<section className="social-preview__section facebook-preview__section">
				<h3 className="social-preview__section-heading">
					{ translate( 'Your post', { comment: 'Refers to a social post on Facebook' } ) }
				</h3>
				<p className="social-preview__section-desc">
					{ translate( 'This is what your social post will look like on Facebook:' ) }
				</p>
				<FacebookLinkPreview { ...props } />
			</section>
		</div>
	);
};

export default FacebookPreview;
