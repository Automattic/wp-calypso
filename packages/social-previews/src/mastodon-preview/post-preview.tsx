import { __ } from '@wordpress/i18n';
import { baseDomain } from '../helpers';
import { mastodonBody, mastodonUrl, mastodonTitle } from './helpers';
import MastodonPostActions from './post/actions';
import MastodonPostHeader from './post/header';
import type { MastodonPreviewProps } from './types';

import './styles.scss';

export const MastodonPostPreview: React.FC< MastodonPreviewProps > = ( {
	title,
	user,
	url,
	image,
} ) => (
	<div className="mastodon-preview__card">
		<MastodonPostHeader user={ user } />
		<div className="mastodon-preview__body">
			{ mastodonBody( title ) }
			&nbsp;
			<a href={ url } target="_blank" rel="noreferrer noopener">
				{ mastodonUrl( url.replace( /^https?:\/\//, '' ) ) }
			</a>
			<div className="mastodon-preview__window">
				<div className="mastodon-preview__window-img">
					{ image && (
						<img src={ image } alt={ __( 'Mastodon preview thumbnail', 'social-previews' ) } />
					) }
				</div>
				<div className="mastodon-preview__window-text">
					<span className="mastodon-preview__window-title">{ mastodonTitle( title ) }</span>
					<span className="mastodon-preview__window-site">{ baseDomain( url ) }</span>
				</div>
			</div>
		</div>
		<MastodonPostActions />
	</div>
);
