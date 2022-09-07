import { Button } from '@automattic/components';
import { FeaturedItemCardProps } from '../types';

import './style.scss';

export const FeaturedItemCard: React.FC< FeaturedItemCardProps > = ( {
	ctaAsPrimary,
	ctaHref,
	ctaLabel,
	description,
	hero,
	isCtaDisabled,
	onClickCta,
	price,
	title,
} ) => {
	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h2 className="featured-item-card--title">{ title }</h2>
					<div className="featured-item-card--price">{ price }</div>
					<div className="featured-item-card--desc">{ description }</div>
				</div>
				<div className="featured-item-card--footer">
					<Button
						primary={ ctaAsPrimary }
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						href={ isCtaDisabled ? '#' : ctaHref }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
