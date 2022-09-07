import { Button } from '@automattic/components';
import { SimpleProductCardProps } from '../types';

import './style.scss';

export const SimpleProductCard: React.FC< SimpleProductCardProps > = ( {
	ctaAsPrimary,
	ctaHref,
	ctaLabel,
	description,
	icon,
	isCtaDisabled,
	onClickCta,
	price,
	title,
} ) => {
	return (
		<div className="simple-product-card">
			{ icon ? <div className="simple-product-card__icon">{ icon }</div> : null }
			<div className="simple-product-card__body">
				<div className="simple-product-card__header">
					<div>
						<h3 className="simple-product-card__title">{ title }</h3>
						<div className="simple-product-card__price">{ price }</div>
					</div>
					<Button
						className="simple-product-card__cta"
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						href={ isCtaDisabled ? '#' : ctaHref }
						primary={ ctaAsPrimary }
					>
						{ ctaLabel }
					</Button>
				</div>
				<div className="simple-product-card__footer">{ description }</div>
			</div>
		</div>
	);
};
