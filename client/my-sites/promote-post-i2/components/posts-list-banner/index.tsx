import { translate } from 'i18n-calypso';
import './style.scss';
import photoBanner from 'calypso/assets/images/blaze/wp-blaze-banner@3x.png';
import cssSafeUrl from 'calypso/lib/css-safe-url';

export default function PostsListBanner() {
	return (
		<div className="posts-list-banner__container">
			<div className="posts-list-banner__content">
				<section className="posts-list-banner__text-section">
					<div className="posts-list-banner__header">
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M14 8.89826C14 9.6343 13.8435 10.3599 13.5378 11.0401C13.232 11.7203 12.7875 12.3378 12.2221 12.8576C11.6603 13.3773 10.9919 13.789 10.2558 14.0715C9.90737 14.2041 9.54824 14.3052 9.182 14.375L9.34556 14.2878C9.34556 14.2878 10.7607 13.4785 11.0416 11.6645C11.1732 10.0459 9.82914 9.33779 9.82914 9.33779C9.82914 9.33779 9.14644 10.2023 8.17573 10.2023C6.65033 10.2023 6.92708 7.66447 6.92708 7.66447C6.92708 7.66447 4.6129 8.8564 4.6129 11.4517C4.6129 13.0738 6.24853 14.2703 6.24853 14.2703V14.2738C6.03519 14.218 5.8254 14.1483 5.61917 14.068C4.88314 13.7855 4.21466 13.3738 3.65286 12.8541C3.09106 12.3343 2.64304 11.7169 2.33724 11.0366C2.03145 10.3564 1.875 9.63081 1.875 8.89477C1.875 6.40407 4.78358 3.99012 4.78358 3.99012C4.78358 3.99012 5.06092 5.8843 6.47966 5.8843C9.14644 5.8843 8.17573 1.625 8.17573 1.625C8.17573 1.625 10.6007 3.04477 11.3297 6.82965C12.6528 6.65789 12.5422 4.93547 12.5422 4.93547C12.5422 4.93547 14 6.82965 14 8.9157"
								fill="#E65054"
							/>
						</svg>

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
