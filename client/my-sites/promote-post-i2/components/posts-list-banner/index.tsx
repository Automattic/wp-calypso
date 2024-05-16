import { translate } from 'i18n-calypso';
import './style.scss';
import photoBanner from 'calypso/assets/images/blaze/wp-blaze-banner@3x.png';
import BlazeLogo from 'calypso/components/blaze-logo';
import cssSafeUrl from 'calypso/lib/css-safe-url';

export default function PostsListBanner() {
	return (
		<div className="posts-list-banner__container">
			<div className="posts-list-banner__content">
				<section className="posts-list-banner__text-section">
					<div className="posts-list-banner__header">
						<BlazeLogo size={ 16 } className="blaze" colorStart="#E65054" colorEnd="#E65054" />
						{ translate( 'Powered by Blaze' ) }
					</div>
					<div className="posts-list-banner__title wp-brand-font">
						{ translate( 'Transform content to an ad with a click.' ) }
					</div>
					<div className="posts-list-banner__description">
						{ translate(
							'Grow your audience by promoting your content across Tumblr and WordPress.com.'
						) }
					</div>
				</section>
				<section className="posts-list-banner__img-section">
					<div
						className="posts-list-banner__img"
						style={ {
							backgroundImage: `url(${ cssSafeUrl( photoBanner ) })`,
						} }
					/>
				</section>
			</div>
		</div>
	);
}
