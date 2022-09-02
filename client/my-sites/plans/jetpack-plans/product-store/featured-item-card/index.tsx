import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useItemInfo } from '../hooks/use-item-info';
import { ItemPrice } from '../item-price';
import { FeaturedItemCardProps } from '../types';

import './style.scss';

export const FeaturedItemCard: React.FC< FeaturedItemCardProps > = ( {
	checkoutURL,
	ctaAsPrimary,
	ctaLabel,
	hero,
	isIncludedInPlan,
	isOwned,
	item,
	onClickMore,
	onClickPurchase,
	siteId,
	purchase,
} ) => {
	const translate = useTranslate();
	const { displayName: title, description } = item;

	const { isNotPlanOwner } = useItemInfo( { purchase } );
	const shouldDisableButton = isOwned && isNotPlanOwner;

	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h2 className="featured-item-card--title">{ title }</h2>
					<div className="featured-item-card--price">
						<ItemPrice
							isIncludedInPlan={ isIncludedInPlan }
							isOwned={ isOwned }
							item={ item }
							siteId={ siteId }
						/>
					</div>
					<div className="featured-item-card--desc">
						<p>
							<span>{ description }</span>
							<br />
							<Button
								className="featured-item-card--learn-more"
								onClick={ onClickMore }
								href="#"
								plain
							>
								{ translate( 'More about %(product)s', {
									args: {
										product: title,
									},
								} ) }
							</Button>
						</p>
					</div>
				</div>
				<div className="featured-item-card--footer">
					<Button
						primary={ ctaAsPrimary }
						onClick={ onClickPurchase }
						disabled={ shouldDisableButton }
						href={ shouldDisableButton ? '#' : checkoutURL }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
