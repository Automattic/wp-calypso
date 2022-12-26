import { Button } from '@automattic/components';
import { FeaturedItemCardProps } from '../types';

import './style.scss';

export const FeaturedItemCard: React.FC< FeaturedItemCardProps > = ( {
	amountSaved,
	ctaAsPrimary,
	ctaHref,
	ctaLabel,
	ctaAriaLabel,
	description,
	hero,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
	price,
	title,
} ) => {
	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h3 className="featured-item-card--title">{ title }</h3>
					<div className="featured-item-card--price">{ price }</div>
					{ amountSaved ? (
						<div className="featured-item-card--amount-saved">{ amountSaved }</div>
					) : null }
					<div className="featured-item-card--desc">{ description }</div>
				</div>
				<div className="featured-item-card--footer">
					<Button
						className="featured-item-card--cta"
						primary={ ctaAsPrimary }
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						target={ isCtaExternal ? '_blank' : undefined }
						href={ isCtaDisabled ? '#' : ctaHref }
						aria-label={ ctaAriaLabel }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
