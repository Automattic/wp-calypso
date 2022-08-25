import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import promoteMenuIllustration from 'calypso/assets/images/customer-home/illustration--promote-menu.svg';

import './style.scss';

export default function PostsListBanner() {
	return (
		<div className="posts-list-banner__container">
			<div className="posts-list-banner__img">
				<img
					src={ promoteMenuIllustration }
					alt=""
					width={ 200 }
					className="posts-list-banner__illustration"
				/>
			</div>
			<div>
				<div className="posts-list-banner__title wp-brand-font">
					{ translate( 'Promote your work' ) }
				</div>
				<div className="posts-list-banner__description">
					{ translate(
						'Reach more people promoting a post or a page to the larger WordPress.com community of blogs and sites'
					) }
				</div>
				<div className="posts-list-banner__footer">
					<Gridicon icon="my-sites" />
					{ translate( 'WordPress.com Ads' ) }
				</div>
			</div>
		</div>
	);
}
