import { useTranslate } from 'i18n-calypso';
import FacebookPostIcon from '../icons';
import defaultAvatar from './default-avatar.png';
import type { FacebookUser } from '../../types';

import './styles.scss';

const FacebookPostHeader: React.FC< { user?: FacebookUser } > = ( { user } ) => {
	const translate = useTranslate();

	return (
		<div className="facebook-preview__post-header">
			<div className="facebook-preview__post-header-content">
				<img
					className="facebook-preview__post-header-avatar"
					src={ user?.avatarUrl || defaultAvatar }
					alt=""
				/>
				<div>
					<div className="facebook-preview__post-header-name">
						{ user?.displayName ||
							translate( 'Anonymous User', { comment: 'Name of a fictional Facebook User' } ) }
					</div>
					<div className="facebook-preview__post-header-share">
						<span className="facebook-preview__post-header-time">
							{ translate( 'Just now', {
								comment: 'Temporal indication of when a post was published',
							} ) }
						</span>
						<span className="facebook-preview__post-header-dot" aria-hidden="true">
							·
						</span>
						<FacebookPostIcon name="public" />
					</div>
				</div>
			</div>
			<ul className="facebook-preview__post-header-more">
				<li></li>
				<li></li>
				<li></li>
			</ul>
		</div>
	);
};

export default FacebookPostHeader;
