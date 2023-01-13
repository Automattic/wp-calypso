import { Gridicon } from '@automattic/components';
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
					{ translate( 'Promote your content with Blaze' ) }
				</div>
				<div className="posts-list-banner__description">
					{ translate(
						'Reach more people promoting your work to the larger WordPress.com community of blogs and sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: learnMoreLink,
							},
						}
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
