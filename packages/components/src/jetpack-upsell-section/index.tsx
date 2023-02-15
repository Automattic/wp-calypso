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
				isFree: false,
				slug: 'security',
				title: translate( 'Security' ),
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
