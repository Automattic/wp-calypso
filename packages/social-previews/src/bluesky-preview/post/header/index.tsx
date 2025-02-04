import { __, _x } from '@wordpress/i18n';
import type { BlueskyPreviewProps } from '../../types';

import './styles.scss';

type Props = Pick< BlueskyPreviewProps, 'user' >;

const BlueskyPostHeader: React.FC< Props > = ( { user } ) => {
	const { displayName, address } = user || {};

	return (
		<div className="bluesky-preview__post-header">
			<div className="bluesky-preview__post-header-user">
				<span className="bluesky-preview__post-header--displayname">
					{ displayName || __( 'Account name' ) }
				</span>
				&nbsp;
				<span className="bluesky-preview__post-header--username">
					{ address || 'username.bsky.social' }
				</span>
			</div>
			<div className="bluesky-preview__post-header--separator">·</div>
			<div className="bluesky-preview__post-header--date">
				{ _x(
					'1h',
					'refers to the time since the post was published, e.g. "1h"',
					'social-previews'
				) }
			</div>
		</div>
	);
};

export default BlueskyPostHeader;
