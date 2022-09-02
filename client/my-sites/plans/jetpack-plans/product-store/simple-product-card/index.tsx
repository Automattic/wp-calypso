import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useItemInfo } from '../hooks/use-item-info';
import { ItemPrice } from '../item-price';
import { SimpleProductCardProps } from '../types';
import getProductIcon from '../utils/get-product-icon';

import './style.scss';

const SimpleProductCard: React.FC< SimpleProductCardProps > = ( {
	checkoutURL,
	ctaAsPrimary,
	ctaLabel,
	isIncludedInPlan,
	isOwned,
	item,
	onClickMore,
	onClickPurchase,
	siteId,
	purchase,
} ) => {
	const translate = useTranslate();

	const { shortName: name } = item;
	const productDescription = item?.shortDescription || item.description;

	const { isNotPlanOwner } = useItemInfo( { purchase } );
	const shouldDisableButton = isOwned && isNotPlanOwner;
	return (
		<div className="simple-product-card">
			<div className="simple-product-card__icon">
				<img alt="" src={ getProductIcon( { productSlug: item.productSlug } ) } />
			</div>
			<div className="simple-product-card__info">
				<div className="simple-product-card__info-header">
					<div className="simple-product-card__info-header-content">
						<h3 className="simple-product-card__info-header-text">{ name }</h3>

						<ItemPrice
							isIncludedInPlan={ isIncludedInPlan }
							isOwned={ isOwned }
							item={ item }
							siteId={ siteId }
						/>
					</div>
					<Button
						className="simple-product-card__info-header-checkout"
						onClick={ onClickPurchase }
						disabled={ shouldDisableButton }
						href={ shouldDisableButton ? '#' : checkoutURL }
						primary={ ctaAsPrimary }
						compact
					>
						{ ctaLabel }
					</Button>
				</div>
				<div className="simple-product-card__info-content">
					{ productDescription }
					<Button
						className="simple-product-card__info-more-link"
						onClick={ onClickMore }
						href="#"
						plain
					>
						{ translate( 'More about %(name)s', { args: { name } } ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SimpleProductCard;
