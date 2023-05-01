import { __ } from '@wordpress/i18n';
import TumblrPostIcon from '../icons';
import type { TumblrPreviewProps } from '../../types';

import './styles.scss';

type Props = Pick< TumblrPreviewProps, 'user' | 'readOnly' >;

const TumblrPostHeader: React.FC< Props > = ( { user, readOnly } ) => (
	<div className="tumblr-preview__post-header">
		<div className="tumblr-preview__post-header-username">
			{ user?.displayName ||
				// translators: username of a fictional Tumblr User
				__( 'anonymous-user', 'tumblr-preview' ) }
			{ readOnly && (
				<span className="tumblr-preview__post-header-follow">
					{
						// translators: action to follow a user on Tumblr
						__( 'Follow', 'tumblr-preview' )
					}
				</span>
			) }
		</div>
		<TumblrPostIcon name="ellipsis" />
	</div>
);

export default TumblrPostHeader;
