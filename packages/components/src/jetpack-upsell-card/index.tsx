import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Button, Card, Gridicon } from '..';
import SecurityIcon from '../../assets/jetpack-icon-lock.svg';
import BackupIcon from '../../assets/jetpack-product-icon-backup.svg';
import BoostIcon from '../../assets/jetpack-product-icon-boost.svg';
import SearchIcon from '../../assets/jetpack-product-icon-search.svg';
import SocialIcon from '../../assets/jetpack-product-icon-social.svg';
import VideoPressIcon from '../../assets/jetpack-product-icon-videopress.svg';
import './style.scss';

type JetpackUpsellCardProps = {
	purchasedProducts: string[];
	siteSlug?: string | null;
	upgradeUrls: Record< string, string >;
};

type Product = {
	description: string;
	href: string;
	iconUrl: string;
	isFree: boolean;
	slug: string;
	title: string;
};

export default function JetpackUpsellCard( {
	purchasedProducts,
	siteSlug,
	upgradeUrls,
}: JetpackUpsellCardProps ) {
	// TODO: Make card collapsible

	const translate = useTranslate();
	const PRODUCTS = useMemo(
		() => [
			{
				description: translate(
					'Protect your site from hackers and spam with automated backups, malware scanning, and spam filtering.'
				),
				href: 'https://jetpack.com/features/security/',
				iconUrl: SecurityIcon,
				isFree: false,
				slug: 'security',
				title: translate( 'Security' ),
			},
			{
				description: translate(
					'Save every single change and get back online quickly with one-click restores.'
				),
				href: 'https://jetpack.com/upgrade/backup/',
				iconUrl: BackupIcon,
				isFree: false,
				slug: 'backup',
				title: translate( 'Backup' ),
			},
			{
				description: translate(
					"Help your site visitors instantly find what they're looking for so they read and buy more."
				),
				href: 'https://jetpack.com/upgrade/search/',
				iconUrl: SearchIcon,
				isFree: false,
				slug: 'search',
				title: translate( 'Search' ),
			},
			{
				description: translate(
					'Engage your visitors with high-quality, ad-free videos build specifically for WordPress.'
				),
				href: 'https://jetpack.com/videopress/',
				iconUrl: VideoPressIcon,
				isFree: false,
				slug: 'video',
				title: translate( 'VideoPress' ),
			},
			{
				description: translate(
					"Improve your site's performance and SEO in a few clicks with the free Jetpack Boost plugin."
				),
				href: 'https://jetpack.com/boost/',
				iconUrl: BoostIcon,
				isFree: true,
				slug: 'boost',
				title: translate( 'Boost' ),
			},
			{
				description: translate(
					'Save time by auto-posting your content to social networks like Facebook, Twitter, and more.'
				),
				href: 'https://jetpack.com/social/',
				iconUrl: SocialIcon,
				isFree: true,
				slug: 'social',
				title: translate( 'Social' ),
			},
			// TODO: Add Jetpack CRM upsell.
		],
		[ translate ]
	) as Product[];

	const hasProductsToUpsell = useMemo(
		() => PRODUCTS.length > purchasedProducts.length,
		[ purchasedProducts, PRODUCTS ]
	);

	return ! hasProductsToUpsell ? null : (
		<Card className="jetpack-upsell-card">
			<h2 className="jetpack-upsell-card__title">
				{ translate( 'Enhance %(siteSlug)s with Jetpack Security, Performance, and Growth tools', {
					args: { siteSlug: siteSlug ?? 'your site' },
				} ) }
			</h2>
			<div className="jetpack-upsell-card__content">
				{ /* Only upsell products that the customer does not own. */ }
				{ PRODUCTS.filter( ( product ) => ! purchasedProducts?.includes( product.slug ) ).map(
					( { title, description, href, iconUrl, slug } ) => (
						<div className="jetpack-upsell-card__product" key={ slug }>
							<div className="jetpack-upsell-card__product-icon">
								<img src={ iconUrl } alt={ title } width="24px" height="24px" />
							</div>
							<h3 className="jetpack-upsell-card__product-title">{ title }</h3>
							<p className="jetpack-upsell-card__product-description">{ description }</p>
							<a href={ href } className="jetpack-upsell-card__product-link">
								<span className="jetpack-upsell-card__product-link-text">
									{ translate( 'More about %(productName)s', {
										args: { productName: title },
									} ) }
								</span>
								<Gridicon icon="external" size={ 16 } />
							</a>
							<Button href={ upgradeUrls[ slug ] } className="jetpack-upsell-card__product-button">
								{ translate( 'Upgrade' ) }
							</Button>
						</div>
					)
				) }
			</div>
		</Card>
	);
}
