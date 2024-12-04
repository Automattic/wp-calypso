import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
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
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	isProductInCart,
	isVertical,
	onClickCta,
	price,
	title,
	variant,
} ) => {
	return (
		<div
			className={ clsx( 'featured-item-card', { [ 'featured-item-card--vertical' ]: isVertical } ) }
		>
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h3 className="featured-item-card--title">{ title }</h3>
					{ variant }
					<div className="featured-item-card--price">{ price }</div>
					{ amountSaved ? (
						<div className="featured-item-card--amount-saved">{ amountSaved }</div>
					) : null }
					<div className="featured-item-card--desc">{ description }</div>
				</div>
				<div className="featured-item-card--footer">
					{ moreInfoLink }
					<Button
						className="featured-item-card--cta"
						primary={ ctaAsPrimary }
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						target={ isCtaExternal ? '_blank' : undefined }
						href={ isCtaDisabled ? '#' : ctaHref }
						aria-label={ ctaAriaLabel }
					>
						{ isProductInCart && <Gridicon icon="checkmark" /> }
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
