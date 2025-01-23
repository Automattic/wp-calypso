import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Button, Card, Gridicon } from '..';
import SecurityIcon from '../assets/jetpack-icon-lock.svg';
import BackupIcon from '../assets/jetpack-product-icon-backup.svg';
import BoostIcon from '../assets/jetpack-product-icon-boost.svg';
import SearchIcon from '../assets/jetpack-product-icon-search.svg';
import SocialIcon from '../assets/jetpack-product-icon-social.svg';
import VideoPressIcon from '../assets/jetpack-product-icon-videopress.svg';
import './style.scss';

type Product = {
	description: string;
	href: string;
	iconUrl: string;
	isFree: boolean;
	slug: string;
	title: string;
	features: string[];
};

type JetpackUpsellCardProps = {
	purchasedProducts: string[];
	siteSlug?: string | null;
	siteFeatures: string[];
	upgradeUrls: Record< string, string >;
};

export function JetpackUpsellCard( {
	purchasedProducts,
	siteSlug,
	siteFeatures,
	upgradeUrls = {},
}: JetpackUpsellCardProps ) {
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
				title: translate( 'Security', { context: 'Jetpack product name' } ),
				features: [ 'scan' ],
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
				features: [ 'backups', 'restore' ],
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
				features: [ 'search', 'instant-search' ],
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
				features: [ 'videopress', 'videopress-1tb-storage' ],
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
				features: [
					'cloud-critical-css',
					'cornerstone-10-pages',
					'image-cdn-liar',
					'image-cdn-quality',
					'image-size-analysis',
					'performance-history',
				],
			},
			{
				description: translate(
					'Save time by auto-posting your content to social networks like Facebook, LinkedIn, and more.'
				),
				href: 'https://jetpack.com/social/',
				iconUrl: SocialIcon,
				isFree: true,
				slug: 'social',
				title: translate( 'Social' ),
				features: [
					'social-enhanced-publishing',
					'social-image-generator',
					'subscriber-unlimited-imports',
				],
			},
			// TODO: Add Jetpack CRM upsell.
		],
		[ translate ]
	) as Product[];

	let visibleProducts = PRODUCTS.filter(
		( { slug } ) => ! purchasedProducts?.includes( slug ) && slug in upgradeUrls
	);
	const hasProductsToUpsell = visibleProducts.length > 0;

	// New product visibility testing based on siteFeatures.
	// If any of the product features are not in siteFeatures, it's a potential upsell.
	visibleProducts = PRODUCTS.filter( ( product ) =>
		product.features.some( ( feature ) => ! siteFeatures.includes( feature ) )
	);

	return ! hasProductsToUpsell ? null : (
		<Card className="jetpack-upsell-card">
			<h2 className="jetpack-upsell-card__title">
				<span className="jetpack-upsell-card__title--long">
					{ translate(
						'Enhance %(siteSlug)s with Jetpack Security, Performance, and Growth tools',
						{
							args: { siteSlug: siteSlug ?? 'your site' },
						}
					) }
				</span>
				<span className="jetpack-upsell-card__title--short">
					{ translate( 'Explore more tools by Jetpack' ) }
				</span>
			</h2>
			<div className="jetpack-upsell-card__content">
				{ /* Only upsell products that the customer does not own. */ }
				{ visibleProducts.map( ( { title, description, href, iconUrl, slug } ) => (
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
						<Button
							href={ upgradeUrls[ slug ] }
							className="jetpack-upsell-card__product-button"
							aria-label={
								translate( 'Upgrade to Jetpack %(productName)s', {
									args: { productName: title },
								} ) as string
							}
						>
							{ translate( 'Upgrade' ) }
						</Button>
					</div>
				) ) }
			</div>
		</Card>
	);
}

export default JetpackUpsellCard;
