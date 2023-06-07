import { __ } from '@wordpress/i18n';
import { DEFAULT_MASTODON_INSTANCE } from '../../constants';
import MastodonPostIcon from '../icons';
import type { MastodonPreviewProps } from '../../types';

import './styles.scss';

type Props = Pick< MastodonPreviewProps, 'user' >;

const MastodonPostHeader: React.FC< Props > = ( { user } ) => {
	const { displayName, address, avatarUrl } = user || {};

	return (
		<div className="mastodon-preview__post-header">
			<div className="mastodon-preview__post-header-user">
				{ avatarUrl && <img className="mastodon-preview__post-avatar" src={ avatarUrl } alt="" /> }
				<div>
					<div className="mastodon-preview__post-header-displayname">
						{ displayName ||
							// translators: username of a fictional Mastodon User
							__( 'anonymous-user', 'social-previews' ) }
					</div>
					<div className="mastodon-preview__post-header-username">
						{ address?.replace( `@${ DEFAULT_MASTODON_INSTANCE }`, '' ) }
					</div>
				</div>
			</div>
			<div className="mastodon-preview__post-header-audience">
				<MastodonPostIcon name="globe" />
				{
					// translators: time elapsed since post was published (1 hour)
					__( '1h', 'social-previews' )
				}
			</div>
		</div>
	);
};

export default MastodonPostHeader;
