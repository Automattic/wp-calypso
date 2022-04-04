import { Card, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import useBillingDashboardQuery from 'calypso/state/partner-portal/licenses/hooks/use-billing-dashboard-query';
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
					<div>{ translate( 'Assigned licenses' ) }</div>
					<div>{ translate( 'Unassigned licenses' ) }</div>
					<div>
						{ billing.isSuccess &&
							billing.data.priceInterval === 'day' &&
							translate( 'Days in Total' ) }
					</div>
				</div>
			</Card>

			{ billing.isSuccess &&
				billing.data.products.map( ( product ) => (
					<Card compact key={ product.productSlug }>
						<div className="billing-details__row">
							<div className="billing-details__product">
								{ product.productName }
								<span className="billing-details__line-item-meta">
									{ billing.data.priceInterval === 'day' &&
										translate( 'Price per license per day: %(price)s', {
											args: { price: formatCurrency( product.productCost, 'USD' ) },
										} ) }

									{ billing.data.priceInterval === 'month' &&
										translate( 'Price per license per month: %(price)s', {
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
								{ billing.data.priceInterval === 'day' &&
									translate( '%(count)d Day', '%(count)d Days', {
										count: product.productQuantity,
										args: { count: product.productQuantity },
									} ) }

								{ billing.data.priceInterval === 'month' &&
									translate( '%(count)d License', '%(count)d Licenses', {
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
							{ billing.isLoading && <TextPlaceholder /> }

							{ billing.isError && <Gridicon icon="minus" /> }
						</div>

						<div className="billing-details__assigned">
							{ billing.isLoading && <TextPlaceholder /> }

							{ billing.isError && <Gridicon icon="minus" /> }
						</div>

						<div className="billing-details__unassigned">
							{ billing.isLoading && <TextPlaceholder /> }

							{ billing.isError && <Gridicon icon="minus" /> }
						</div>

						<div className="billing-details__subtotal">
							{ billing.isLoading && <TextPlaceholder /> }

							{ billing.isError && <Gridicon icon="minus" /> }
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

						{ billing.isLoading && <TextPlaceholder /> }
					</span>
					<strong className="billing-details__cost-amount">
						{ billing.isSuccess && formatCurrency( billing.data.costs.total, 'USD' ) }

						{ billing.isLoading && <TextPlaceholder /> }

						{ billing.isError && <Gridicon icon="minus" /> }
					</strong>

					{ billing.isSuccess && billing.data.priceInterval === 'month' && (
						<>
							<span className="billing-details__total-label billing-details__line-item-meta">
								{ translate( 'Assigned licenses:' ) }
							</span>
							<span className="billing-details__line-item-meta">
								{ formatCurrency( billing.data.costs.assigned, 'USD' ) }
							</span>
						</>
					) }

					{ billing.isSuccess && billing.data.priceInterval === 'month' && (
						<>
							<span className="billing-details__total-label billing-details__line-item-meta">
								{ translate( 'Unassigned licenses:' ) }
							</span>
							<span className="billing-details__line-item-meta">
								{ formatCurrency( billing.data.costs.unassigned, 'USD' ) }
							</span>
						</>
					) }
				</div>
			</Card>
		</div>
	);
}
