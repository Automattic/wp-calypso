import { Gridicon, Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import promoteMenuIllustration from 'calypso/assets/images/customer-home/illustration--blaze.svg';
import './style.scss';
import InlineSupportLink from 'calypso/components/inline-support-link';

export default function PostsListBanner() {
	const learnMoreLink = <InlineSupportLink supportContext="advertising" showIcon={ false } />;

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
					{ translate( 'Get more visitors to your site' ) }
				</div>
				<div className="posts-list-banner__description">
					{ translate(
						'Reach more people promoting your work to the larger WordPress.com community of blogs and sites.'
					) }
				</div>
				<Button compact className="posts-list-banner__learn-more">
					<span>{ learnMoreLink }</span>
				</Button>
				<div className="posts-list-banner__footer">
					<Gridicon icon="my-sites" />
					{ translate( 'WordPress.com Ads' ) }
				</div>
			</div>
		</div>
	);
}
