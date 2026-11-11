import { Card, ProductIcon } from '@automattic/components';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

interface Props {
	action?: ReactNode;
	details?: ReactNode;
	headerChildren?: ReactNode;
	isError?: boolean;
	isPlaceholder?: boolean;
	product?: string;
	tagline?: ReactNode;
	title?: ReactNode;
}

const MyPlanCard = ( {
	action,
	isError,
	isPlaceholder,
	details,
	product,
	tagline,
	title,
	headerChildren,
}: Props ) => {
	const cardClassNames = clsx( 'my-plan-card', {
		'is-placeholder': isPlaceholder,
		'has-action-only': action && ! details && ! isPlaceholder,
	} );
	const detailsClassNames = clsx( 'my-plan-card__details', { 'is-error': isError } );

	return (
		<Card className={ cardClassNames } compact data-e2e-product-slug={ product }>
			<div className="my-plan-card__primary">
				<div className="my-plan-card__icon">
					{ ! isPlaceholder && product && <ProductIcon slug={ product } /> }
				</div>
				<div className="my-plan-card__header">
					{ title && <h2 className="my-plan-card__title">{ title }</h2> }
					{ tagline && <p className="my-plan-card__tagline">{ tagline }</p> }
					{ headerChildren }
				</div>
			</div>
			{ ( details || action || isPlaceholder ) && (
				<div className="my-plan-card__secondary">
					<div className={ detailsClassNames }>{ isPlaceholder ? null : details }</div>
					<div className="my-plan-card__action">{ isPlaceholder ? null : action }</div>
				</div>
			) }
		</Card>
	);
};

export default MyPlanCard;
