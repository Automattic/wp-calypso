import { translate } from 'i18n-calypso';
import './style.scss';
import photoBanner from 'calypso/assets/images/blaze/woo-blaze-banner@3x.png';
import BlazeLogo from 'calypso/components/blaze-logo';
import cssSafeUrl from 'calypso/lib/css-safe-url';

export default function WooBanner() {
	return (
		<div className="posts-list-woo-banner__container">
			<div className="posts-list-banner__content">
				<section className="posts-list-banner__text-section">
					<div className="posts-list-banner__header">
						<BlazeLogo size={ 16 } className="blaze" colorStart="#8052B2" colorEnd="#8052B2" />
						{ translate( 'Powered by Blaze' ) }
					</div>
					<div className="posts-list-banner__title wp-brand-font">
						{ translate( 'Transform your content to an ad with a click.' ) }
					</div>
					<div className="posts-list-banner__description">
						{ translate(
							'Increase your sales by promoting your products and pages across millions of blogs and sites.'
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
