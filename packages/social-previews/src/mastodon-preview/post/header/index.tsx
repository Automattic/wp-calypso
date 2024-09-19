import { __ } from '@wordpress/i18n';
import { formatMastodonDate } from '../../../helpers';
import { DEFAULT_AVATAR, DEFAULT_MASTODON_INSTANCE } from '../../constants';
import { GlobeIcon } from '../icons';
import type { MastodonPreviewProps } from '../../types';

import './styles.scss';

type Props = Pick< MastodonPreviewProps, 'user' >;

const MastodonPostHeader: React.FC< Props > = ( { user } ) => {
	const { displayName, address, avatarUrl } = user || {};

	return (
		<div className="mastodon-preview__post-header">
			<div className="mastodon-preview__post-header-user">
				<img className="mastodon-preview__post-avatar" src={ avatarUrl || DEFAULT_AVATAR } alt="" />
				<div>
					<div className="mastodon-preview__post-header-displayname">
						{ displayName ||
							// translators: username of a fictional Mastodon User
							__( 'anonymous-user', 'social-previews' ) }
					</div>
					<div className="mastodon-preview__post-header-username">
						{ address?.replace( `@${ DEFAULT_MASTODON_INSTANCE }`, '' ) || '@username' }
					</div>
				</div>
			</div>
			<div className="mastodon-preview__post-header-audience">
				<GlobeIcon />
				{ formatMastodonDate( new Date() ) }
			</div>
		</div>
	);
};

export default MastodonPostHeader;
