import { Button } from '@automattic/components';
import { SimpleItemCardProps } from '../types';

import './style.scss';

export const SimpleItemCard: React.FC< SimpleItemCardProps > = ( {
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
		<div className="simple-item-card">
			{ icon ? <div className="simple-item-card__icon">{ icon }</div> : null }
			<div className="simple-item-card__body">
				<div className="simple-item-card__header">
					<div>
						<h3 className="simple-item-card__title">{ title }</h3>
						<div className="simple-item-card__price">{ price }</div>
					</div>
					<Button
						className="simple-item-card__cta"
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						href={ isCtaDisabled ? '#' : ctaHref }
						primary={ ctaAsPrimary }
					>
						{ ctaLabel }
					</Button>
				</div>
				<div className="simple-item-card__footer">{ description }</div>
			</div>
		</div>
	);
};
