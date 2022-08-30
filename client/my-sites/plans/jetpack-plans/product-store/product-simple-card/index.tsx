import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useProductIcon from '../hooks/use-product-icon';
import { ItemPrice } from '../item-price';
import { ProductSimpleCardProps } from '../types';

import './style.scss';

const ProductSimpleCard: React.FC< ProductSimpleCardProps > = ( {
	item,
	isOwned,
	siteId,
	onClickMore,
	onClickPurchase,
	checkoutURL,
} ) => {
	const translate = useTranslate();

	const productIcon = useProductIcon( { productSlug: item.productSlug } );

	const { shortName: name, description } = item;

	return (
		<div className="product-simple-card">
			<div className="product-simple-card__icon">
				<img alt="" src={ productIcon } />
			</div>
			<div className="product-simple-card__info">
				<div className="product-simple-card__info-header">
					<div className="product-simple-card__info-header-content">
						<h3 className="product-simple-card__info-header-text">{ name }</h3>

						<ItemPrice isOwned={ isOwned } item={ item } siteId={ siteId } />
					</div>
					<Button
						className="product-simple-card__info-header-checkout"
						onClick={ onClickPurchase }
						href={ checkoutURL }
						primary
						compact
					>
						{ translate( 'Get' ) }
					</Button>
				</div>
				<div className="product-simple-card__info-content">
					{ description }
					<a
						className="product-simple-card__info-more-link"
						onClick={ onClickMore }
						href="https://jetpack.com/pricing/"
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'More about %(name)s', { args: { name } } ) }
					</a>
				</div>
			</div>
		</div>
	);
};

export default ProductSimpleCard;
