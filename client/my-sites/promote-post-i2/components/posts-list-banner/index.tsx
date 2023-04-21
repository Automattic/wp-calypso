import { sprintf } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import './style.scss';
import photoBanner from 'calypso/assets/images/blaze/zenit-photo-banner.jpeg';
import cssSafeUrl from 'calypso/lib/css-safe-url';

export default function PostsListBanner() {
	const articleTitle = sprintf(
		// translators: %d is the current year
		translate( 'The best camera, gadgets and accessories to buy in %d' ),
		new Date().getFullYear()
	);

	return (
		<div className="posts-list-banner__container">
			<section className="posts-list-banner__text-section">
				<div className="posts-list-banner__title wp-brand-font">
					{ translate( 'Transform content to an ad with a click.' ) }
				</div>
				<div className="posts-list-banner__description">
					{ translate(
						'Grow your audience by promoting your content across Tumblr and WordPress.com.'
					) }
				</div>
				<div className="posts-list-banner__footer">
					<svg
						width="13"
						height="14"
						viewBox="0 0 13 14"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M13 7.89826C13 8.6343 12.8435 9.35988 12.5378 10.0401C12.232 10.7203 11.7875 11.3378 11.2221 11.8576C10.6603 12.3773 9.99186 12.789 9.25583 13.0715C8.90737 13.2041 8.54824 13.3052 8.182 13.375L8.34556 13.2878C8.34556 13.2878 9.76074 12.4785 10.0416 10.6645C10.1732 9.04593 8.82914 8.33779 8.82914 8.33779C8.82914 8.33779 8.14644 9.20231 7.17573 9.20231C5.65033 9.20231 5.92708 6.66447 5.92708 6.66447C5.92708 6.66447 3.6129 7.8564 3.6129 10.4517C3.6129 12.0738 5.24853 13.2703 5.24853 13.2703V13.2738C5.03519 13.218 4.8254 13.1483 4.61917 13.068C3.88314 12.7855 3.21466 12.3738 2.65286 11.8541C2.09106 11.3343 1.64304 10.7169 1.33724 10.0366C1.03145 9.35639 0.875 8.63081 0.875 7.89477C0.875 5.40407 3.78358 2.99012 3.78358 2.99012C3.78358 2.99012 4.06092 4.8843 5.47966 4.8843C8.14644 4.8843 7.17573 0.625 7.17573 0.625C7.17573 0.625 9.60073 2.04477 10.3297 5.82965C11.6528 5.65789 11.5422 3.93547 11.5422 3.93547C11.5422 3.93547 13 5.82965 13 7.9157"
							fill="url(#paint0_linear_6624_8115)"
						/>
						<defs>
							<linearGradient
								id="paint0_linear_6624_8115"
								x1="6.9375"
								y1="0.625"
								x2="6.9375"
								y2="13.375"
								gradientUnits="userSpaceOnUse"
							>
								<stop stop-color="#E94338" />
								<stop offset="1" stop-color="#FFB800" />
							</linearGradient>
						</defs>
					</svg>
					{ translate( 'Powered by Blaze' ) }
				</div>
			</section>
			<section className="posts-list-banner__img-section">
				<div className="posts-list-banner__wrapper">
					<header>PhotoTimes.com</header>
					{ /* TODO: Find a way to inform that the image is from Upsplash */ }
					<img src={ cssSafeUrl( photoBanner ) } alt="" />
					<footer>{ articleTitle }</footer>
				</div>
				<div className="posts-list-banner__article">
					<ul className="posts-list-banner__article-menu">
						<li className="posts-list-banner__article-menu-item posts-list-banner__article-menu-item-active">
							{ translate( 'Articles' ) }
						</li>
						<li className="posts-list-banner__article-menu-item">
							{ translate( 'Photographers' ) }
						</li>
						<li className="posts-list-banner__article-menu-item">{ translate( 'Events' ) }</li>
					</ul>
					<div>{ translate( 'Article' ) }</div>
					<div className="posts-list-banner__article-title">{ articleTitle }</div>
					{ /* translator: %s is an author's name */ }
					<div>{ sprintf( translate( 'by %s' ), 'Tom Newman' ) }</div>
				</div>
			</section>
		</div>
	);
}
