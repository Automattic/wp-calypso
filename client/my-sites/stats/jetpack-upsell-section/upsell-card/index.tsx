import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Product } from './available-upsells';

import './style.scss';

type UpsellCardProps = {
	siteSlug?: string | null;
	upsells: Product[];
};

export function UpsellCard( { siteSlug, upsells }: UpsellCardProps ) {
	const translate = useTranslate();
	const haveUpsells = upsells.length > 0;

	return ! haveUpsells ? null : (
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
				{ upsells.map( ( { title, description, href, iconUrl, slug, checkoutUrl } ) => (
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
							href={ checkoutUrl! }
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

export default UpsellCard;
