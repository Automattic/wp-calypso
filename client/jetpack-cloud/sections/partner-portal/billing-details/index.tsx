/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useBillingDashboardQuery from 'calypso/state/partner-portal/licenses/hooks/use-billing-dashboard-query';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';

/**
 * Style dependencies
 */
import './style.scss';

export default function BillingDetails(): ReactElement {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const billing = useBillingDashboardQuery();

	return (
		<div className="billing-details">
			<Card compact className="billing-details__header">
				<div className="billing-details__row">
					<div>{ translate( 'Products' ) }</div>
					<div>{ translate( 'Assigned' ) }</div>
					<div>{ translate( 'Unassigned' ) }</div>
					<div></div>
				</div>
			</Card>

			{ billing.isSuccess &&
				billing.data.products.map( ( product ) => (
					<Card compact key={ product.productSlug }>
						<div className="billing-details__row">
							<div className="billing-details__product">
								{ product.productName }
								<span className="billing-details__line-item-meta">
									{ translate( 'Price per license: %(price)s', {
										args: { price: formatCurrency( product.productCost, 'USD' ) },
									} ) }
								</span>
							</div>

							<div className="billing-details__assigned">
								{ product.counts.assigned }
								<span className="billing-details__line-item-meta billing-details__line-item-meta--is-mobile">
									{ translate( 'Assigned' ) }
								</span>
							</div>

							<div className="billing-details__unassigned">
								{ product.counts.unassigned }
								<span className="billing-details__line-item-meta billing-details__line-item-meta--is-mobile">
									{ translate( 'Unassigned' ) }
								</span>
							</div>

							<div className="billing-details__subtotal">
								{ translate( '%(count)d License', '%(count)d Licenses', {
									count: product.counts.total,
									args: { count: product.counts.total },
								} ) }
								<span className="billing-details__line-item-meta">
									{ translate( 'Subtotal: %(subtotal)s', {
										args: { subtotal: formatCurrency( product.productTotalCost, 'USD' ) },
									} ) }
								</span>
							</div>
						</div>
					</Card>
				) ) }

			{ ! billing.isSuccess && (
				<Card compact>
					<div className="billing-details__row">
						<div className="billing-details__product">
							<TextPlaceholder />
							<span className="billing-details__line-item-meta">
								<TextPlaceholder />
							</span>
						</div>

						<div className="billing-details__assigned">
							<TextPlaceholder />
							<span className="billing-details__line-item-meta billing-details__line-item-meta--is-mobile">
								<TextPlaceholder />
							</span>
						</div>

						<div className="billing-details__unassigned">
							<TextPlaceholder />
							<span className="billing-details__line-item-meta billing-details__line-item-meta--is-mobile">
								<TextPlaceholder />
							</span>
						</div>

						<div className="billing-details__subtotal">
							<TextPlaceholder />
							<span className="billing-details__line-item-meta">
								<TextPlaceholder />
							</span>
						</div>
					</div>
				</Card>
			) }

			<Card compact className="billing-details__footer">
				<div className="billing-details__row billing-details__row--summary">
					<span className="billing-details__total-label billing-details__cost-label">
						{ billing.isSuccess &&
							translate( 'Cost for {{bold}}%(date)s{{/bold}}', {
								components: { bold: <strong /> },
								args: { date: moment( billing.data.date ).format( 'MMMM, YYYY' ) },
							} ) }

						{ ! billing.isSuccess && <TextPlaceholder /> }
					</span>
					<strong className="billing-details__cost-amount">
						{ billing.isSuccess && formatCurrency( billing.data.costs.total, 'USD' ) }

						{ ! billing.isSuccess && <TextPlaceholder /> }
					</strong>

					<span className="billing-details__total-label billing-details__line-item-meta">
						{ translate( 'Assigned licenses:' ) }
					</span>
					<span className="billing-details__line-item-meta">
						{ billing.isSuccess && formatCurrency( billing.data.costs.assigned, 'USD' ) }

						{ ! billing.isSuccess && <TextPlaceholder /> }
					</span>

					<span className="billing-details__total-label billing-details__line-item-meta">
						{ translate( 'Unassigned licenses:' ) }
					</span>
					<span className="billing-details__line-item-meta">
						{ billing.isSuccess && formatCurrency( billing.data.costs.unassigned, 'USD' ) }

						{ ! billing.isSuccess && <TextPlaceholder /> }
					</span>
				</div>
			</Card>
		</div>
	);
}
