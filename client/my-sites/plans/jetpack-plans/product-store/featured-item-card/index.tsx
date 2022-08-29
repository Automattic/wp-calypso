import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ItemPrice } from '../item-price';
import { FeaturedItemCardProps } from '../types';

import './style.scss';

export const FeaturedItemCard: React.FC< FeaturedItemCardProps > = ( {
	checkoutURL,
	hero,
	item,
	onClickMore,
	onClickPurchase,
	siteId,
} ) => {
	const translate = useTranslate();
	const { displayName: title, description } = item;

	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h2 className="featured-item-card--title">{ title }</h2>
					<div className="featured-item-card--price">
						<ItemPrice item={ item } siteId={ siteId } />
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
					<Button primary onClick={ onClickPurchase } href={ checkoutURL }>
						{ translate( 'Get' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};
