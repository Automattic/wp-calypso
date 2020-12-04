/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import React, { FC, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { Button, ProductIcon } from '@automattic/components';
import { preventWidows } from 'calypso/lib/formatting';
import PlanPrice from 'calypso/my-sites/plan-price';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	className?: string;
	iconSlug: string;
	productName: TranslateResult;
	description?: ReactNode;
	currencyCode: string | null;
	price: number;
	billingTimeFrame: TranslateResult;
	buttonLabel: TranslateResult;
	buttonPrimary?: boolean;
	badgeLabel?: TranslateResult;
	onButtonClick: () => void;
	isOwned?: boolean;
};

const JetpackProductSlideOutCard: FC< Props > = ( {
	className,
	iconSlug,
	productName,
	description,
	currencyCode,
	price,
	billingTimeFrame,
	buttonLabel,
	buttonPrimary = true,
	badgeLabel,
	onButtonClick,
	isOwned,
} ) => {
	const translate = useTranslate();

	return (
		<div
			className={ classNames( className, 'jetpack-product-slide-out-card', {
				'is-owned': isOwned,
			} ) }
		>
			<header className="jetpack-product-slide-out-card__header">
				<h3 className="jetpack-product-slide-out-card__product-name">
					<ProductIcon className="jetpack-product-slide-out-card__icon" slug={ iconSlug } />
					<div>{ preventWidows( productName ) }</div>
				</h3>

				<div className="jetpack-product-slide-out-card__price">
					{ currencyCode && price ? (
						<>
							<span className="jetpack-product-slide-out-card__raw-price">
								<PlanPrice rawPrice={ price } currencyCode={ currencyCode } />
							</span>
							<span className="jetpack-product-slide-out-card__billing-time-frame">
								{ billingTimeFrame }
							</span>
						</>
					) : (
						<>
							<div className="jetpack-product-slide-out-card__price-placeholder" />
							<div className="jetpack-product-slide-out-card__time-frame-placeholder" />
						</>
					) }
				</div>
			</header>
			<div className="jetpack-product-slide-out-card__body">
				{ description && (
					<p className="jetpack-product-slide-out-card__description">{ description }</p>
				) }
				<Button
					primary={ buttonPrimary }
					className="jetpack-product-slide-out-card__button"
					onClick={ onButtonClick }
				>
					{ buttonLabel }
				</Button>
				<span
					className={ classNames( 'jetpack-product-slide-out-card__badge', {
						'is-primary': !! badgeLabel,
					} ) }
				>
					{ badgeLabel ? badgeLabel : preventWidows( translate( 'single product' ) ) }
				</span>
			</div>
		</div>
	);
};

export default JetpackProductSlideOutCard;
