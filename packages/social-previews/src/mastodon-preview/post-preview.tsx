import { __ } from '@wordpress/i18n';
import MastodonPostActions from './post/actions';
import MastonPostBody from './post/body';
import MastodonPostHeader from './post/header';
import type { MastodonPreviewProps } from './types';

import './styles.scss';

export const MastodonPostPreview: React.FC< MastodonPreviewProps > = ( props ) => {
	const { user, customImage, image } = props;

	const img = customImage || image;

	return (
		<div className="mastodon-preview__post">
			<MastodonPostHeader user={ user } />
			<MastonPostBody { ...props }>
				{ img && (
					<img
						className="mastodon-preview__img"
						src={ img }
						alt={ __( 'Mastodon preview thumbnail', 'social-previews' ) }
					/>
				) }
			</MastonPostBody>
			<MastodonPostActions />
		</div>
	);
};
