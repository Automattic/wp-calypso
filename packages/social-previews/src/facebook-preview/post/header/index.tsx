import { __, _x } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import FacebookPostIcon from '../icons';
import type { FacebookUser } from '../../types';

import './styles.scss';

const defaultAvatar =
	'data:image/png;base64,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';

type Props = {
	user?: FacebookUser;
	timeElapsed?: boolean;
	hideOptions?: boolean;
};

const FacebookPostHeader: React.FC< Props > = ( { user, timeElapsed, hideOptions } ) => {
	const [ avatarSrc, setAvatarSrc ] = useState< string >( user?.avatarUrl || defaultAvatar );
	const onImageError = useCallback( () => {
		if ( avatarSrc !== defaultAvatar ) {
			setAvatarSrc( defaultAvatar );
		}
	}, [ avatarSrc ] );

	return (
		<div className="facebook-preview__post-header">
			<div className="facebook-preview__post-header-content">
				<img
					className="facebook-preview__post-header-avatar"
					src={ avatarSrc }
					alt=""
					onError={ onImageError }
				/>
				<div>
					<div className="facebook-preview__post-header-name">
						{ user?.displayName ||
							// translators: name of a fictional Facebook User
							__( 'Anonymous User', 'social-previews' ) }
					</div>
					<div className="facebook-preview__post-header-share">
						<span className="facebook-preview__post-header-time">
							{ timeElapsed
								? __(
										// translators: short version of `1 hour`
										'1h',
										'social-previews'
								  )
								: _x(
										// translators: temporal indication of when a post was published
										'Just now',
										'',
										'social-previews'
								  ) }
						</span>
						<span className="facebook-preview__post-header-dot" aria-hidden="true">
							·
						</span>
						<FacebookPostIcon name="public" />
					</div>
				</div>
			</div>
			{ ! hideOptions && <div className="facebook-preview__post-header-more"></div> }
		</div>
	);
};

export default FacebookPostHeader;
