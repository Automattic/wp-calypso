import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Button from '../button';
import Card from '../card';
import './style.scss';

type JetpackUpsellSectionProps = {
	purchasedProducts: string[];
	siteUrl: string;
};

export default function JetpackUpsellSection( {
	purchasedProducts,
	siteUrl,
}: JetpackUpsellSectionProps ) {
	// TODO: Add collapsible card

	const translate = useTranslate();
	const PRODUCTS = useMemo(
		() => [
			{
				description: translate(
					'Protect your site from hackers and spam with automated backups, malware scanning, and spam filtering.'
				),
				href: 'https://jetpack.com/features/security/',
				icon: 'lock',
				isFree: false,
				slug: 'security',
				title: translate( 'Security' ),
			},
			{
				description: translate(
					'Save every single change and get back online quickly with one-click restores.'
				),
				href: 'https://jetpack.com/upgrade/backup/',
				icon: 'cloud',
				isFree: false,
				slug: 'backup',
				title: translate( 'Backup' ),
			},
			{
				description: translate(
					"Help your site visitors instantly find what they're looking for so they read and buy more."
				),
				href: 'https://jetpack.com/upgrade/search/',
				icon: 'mag',
				isFree: false,
				slug: 'search',
				title: translate( 'Search' ),
			},
			{
				description: translate(
					'Engage your visitors with high-quality, ad-free videos build specifically for WordPress.'
				),
				href: 'https://jetpack.com/videopress/',
				icon: 'video',
				isFree: false,
				slug: 'video',
				title: translate( 'VideoPress' ),
			},
			{
				description: translate(
					"Improve your site's performance and SEO in a few clicks with the free Jetpack Boost plugin."
				),
				href: 'https://jetpack.com/boost/',
				icon: 'boost',
				isFree: true,
				slug: 'boost',
				title: translate( 'Boost' ),
			},
			{
				description: translate(
					'Save time by auto-posting your content to social networks like Facebook, Twitter, and more.'
				),
				href: 'https://jetpack.com/social/',
				icon: 'social',
				isFree: true,
				slug: 'social',
				title: translate( 'Social' ),
			},
			{
				description: translate(
					'Sell more and get more leads with the free Jetpack CRM plugin built specifically for WordPress.'
				),
				href: 'https://jetpackcrm.com/',
				icon: 'video',
				isFree: true,
				slug: 'crm',
				title: translate( 'CRM' ),
			},
		],
		[ translate ]
	);

	return (
		<Card className="jetpack-upsell-section">
			<h2 className="jetpack-upsell-section__title">
				{ translate( 'Enhance %(siteUrl)s with Jetpack Security, Performance, and Growth tools', {
					args: { siteUrl },
				} ) }
			</h2>
			<div className="jetpack-upsell-section__content">
				{ /* Only upsell products that the customer does not own. */ }
				{ PRODUCTS.filter( ( product ) => ! purchasedProducts?.includes( product.slug ) ).map(
					( { title, description, href, isFree } ) => (
						<div className="jetpack-upsell-section__product">
							<div className="jetpack-upsell-section__product-icon">
								{ /* TODO: Add product-specific icons for each product */ }
								<Icon className="gridicon" icon={ info } />
							</div>
							<h3 className="jetpack-upsell-section__product-title">{ title }</h3>
							<p className="jetpack-upsell-section__product-description">{ description }</p>
							<a href={ href } className="jetpack-upsell-section__product-link">
								{ translate( 'More about %(productName)s', {
									args: { productName: title },
								} ) }
							</a>
							<Button className="jetpack-upsell-section__product-button" primary={ ! isFree }>
								{ isFree ? translate( 'Install Free' ) : translate( 'Upgrade' ) }
							</Button>
						</div>
					)
				) }
			</div>
		</Card>
	);
}
