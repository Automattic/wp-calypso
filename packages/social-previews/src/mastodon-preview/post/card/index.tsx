import { __ } from '@wordpress/i18n';
import { baseDomain } from '../../../helpers';
import { mastodonTitle } from '../../helpers';
import { MastodonPreviewProps } from '../../types';

import './styles.scss';

const MastodonPostCard: React.FC< MastodonPreviewProps > = ( {
	siteName,
	title,
	url,
	image,
	customImage,
} ) => {
	return (
		<div className="mastodon-preview__card">
			<div className="mastodon-preview__card-img">
				{ ( image || customImage ) && (
					<img
						src={ image || customImage }
						alt={ __( 'Mastodon preview thumbnail', 'social-previews' ) }
					/>
				) }
			</div>
			<div className="mastodon-preview__card-text">
				<span className="mastodon-preview__card-title">{ mastodonTitle( title ) }</span>
				<span className="mastodon-preview__card-site">{ siteName || baseDomain( url ) }</span>
			</div>
		</div>
	);
};

export default MastodonPostCard;
