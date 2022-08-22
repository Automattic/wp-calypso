import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';

import './style.scss';

export default function PostsListBanner() {
	return (
		<div className="posts-list-banner__container">
			<div className="posts-list-banner__img">
				<img
					src={ megaphoneIllustration }
					alt=""
					width={ 150 }
					className="posts-list-banner__illustration"
				/>
			</div>
			<div>
				<div className="posts-list-banner__title wp-brand-font">
					{ translate( 'All you need to start advertising' ) }
				</div>
				<div className="posts-list-banner__description">
					{ translate(
						'Launch within minutes, reach specific audiences, and never go over your budget. Find best performing content and promote it.'
					) }
				</div>
				<div className="posts-list-banner__footer">
					<Gridicon icon="my-sites" />
					{ translate( 'All with WordPress.com Ads' ) }
				</div>
			</div>
		</div>
	);
}
