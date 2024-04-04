import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import { useTranslate } from 'i18n-calypso';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { useLicenseLightboxData } from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox/hooks/use-license-lightbox-data';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import getPressablePlan from '../pressable-overview/lib/get-pressable-plan';
import type { ShoppingCartItem } from '../types';

export default function ProductInfo( { product }: { product: ShoppingCartItem } ) {
	const translate = useTranslate();

	const { title, product: productInfo } = useLicenseLightboxData( product );

	let productIcon =
		productInfo?.productSlug && getProductIcon( { productSlug: productInfo?.productSlug } );
	let productTitle = title;
	let productDescription = productInfo?.lightboxDescription;

	if ( product.family_slug === 'pressable-hosting' ) {
		const presablePlan = getPressablePlan( product.slug );
		if ( ! presablePlan ) {
			return null;
		}

		productIcon = pressableIcon;
		productTitle = product.name;
		productDescription = translate(
			'Plan with %(install)d WordPress installs, %(visits)s visits per month, and %(storage)dGB of storage per month.',
			{
				args: {
					install: presablePlan.install,
					visits: formatNumber( presablePlan.visits ),
					storage: presablePlan.storage,
				},
				comment:
					'The `install`, `visits` & `storage` are the count of WordPress installs, visits per month, and storage per month in the plan description.',
			}
		);
	}

	if ( ! productDescription ) {
		return null;
	}

	return (
		<div className="product-info">
			<div className="product-info__icon">
				<img src={ productIcon } alt={ title } />
			</div>
			<div className="product-info__text-content">
				<div className="product-info__header">
					<label htmlFor={ productTitle } className="product-info__label">
						{ productTitle }
					</label>
					<span className="product-info__count">
						{ translate( '%(numLicenses)d plan', '%(numLicenses)d plans', {
							context: 'button label',
							count: product.quantity,
							args: {
								numLicenses: product.quantity,
							},
						} ) }
					</span>
				</div>
				<p className="product-info__description">{ productDescription }</p>
			</div>
		</div>
	);
}
