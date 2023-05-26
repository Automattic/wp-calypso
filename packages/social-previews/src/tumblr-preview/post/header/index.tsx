import { __ } from '@wordpress/i18n';
import TumblrPostIcon from '../icons';
import type { TumblrPreviewProps } from '../../types';

import './styles.scss';

type Props = Pick< TumblrPreviewProps, 'user' >;

const TumblrPostHeader: React.FC< Props > = ( { user } ) => (
	<div className="tumblr-preview__post-header">
		<div className="tumblr-preview__post-header-username">
			{ user?.displayName ||
				// translators: username of a fictional Tumblr User
				__( 'anonymous-user', 'social-previews' ) }
		</div>
		<TumblrPostIcon name="ellipsis" />
	</div>
);

export default TumblrPostHeader;
