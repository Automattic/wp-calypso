import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Button, Card, Gridicon } from '../';
import SecurityIcon from '../../assets/jetpack-icon-lock.svg';
import BackupIcon from '../../assets/jetpack-product-icon-backup.svg';
import BoostIcon from '../../assets/jetpack-product-icon-boost.svg';
import CrmIcon from '../../assets/jetpack-product-icon-crm.svg';
import SearchIcon from '../../assets/jetpack-product-icon-search.svg';
import SocialIcon from '../../assets/jetpack-product-icon-social.svg';
import VideoPressIcon from '../../assets/jetpack-product-icon-videopress.svg';
import './style.scss';

type JetpackUpsellSectionProps = {
	purchasedProducts: string[];
	siteUrl: string;
};

export default function JetpackUpsellSection( {
	purchasedProducts,
	siteUrl,
}: JetpackUpsellSectionProps ) {
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
			{
				description: translate(
					'Sell more and get more leads with the free Jetpack CRM plugin built specifically for WordPress.'
				),
				href: 'https://jetpackcrm.com/',
				iconUrl: CrmIcon,
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
					( { title, description, href, isFree, iconUrl } ) => (
						<div className="jetpack-upsell-section__product">
							<div className="jetpack-upsell-section__product-icon">
								<img src={ iconUrl } alt={ translate( 'included' ) } width="24px" height="24px" />
							</div>
							<h3 className="jetpack-upsell-section__product-title">{ title }</h3>
							<p className="jetpack-upsell-section__product-description">{ description }</p>
							<a href={ href } className="jetpack-upsell-section__product-link">
								<span className="jetpack-upsell-section__product-link-text">
									{ translate( 'More about %(productName)s', {
										args: { productName: title },
									} ) }
								</span>
								<Gridicon icon="external" size={ 16 } />
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
