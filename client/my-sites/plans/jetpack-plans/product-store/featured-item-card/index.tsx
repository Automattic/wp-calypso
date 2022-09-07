import { Button } from '@automattic/components';
import { ItemPrice } from '../item-price';
import { MoreInfoLink } from '../more-info-link';
import { FeaturedItemCardProps } from '../types';

import './style.scss';

export const FeaturedItemCard: React.FC< FeaturedItemCardProps > = ( {
	checkoutURL,
	ctaAsPrimary,
	ctaLabel,
	hero,
	hideMoreInfoLink,
	isCtaDisabled,
	isIncludedInPlan,
	isOwned,
	item,
	onClickMore,
	onClickPurchase,
	siteId,
} ) => {
	const { displayName: title, featuredDescription } = item;

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
							<span>{ featuredDescription }</span>
							<br />

							{ ! hideMoreInfoLink && <MoreInfoLink item={ item } onClickMore={ onClickMore } /> }
						</p>
					</div>
				</div>
				<div className="featured-item-card--footer">
					<Button
						primary={ ctaAsPrimary }
						onClick={ onClickPurchase }
						disabled={ isCtaDisabled }
						href={ isCtaDisabled ? '#' : checkoutURL }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
