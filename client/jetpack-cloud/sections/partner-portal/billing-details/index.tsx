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
	const useDailyPrices = billing.isSuccess && billing.data.priceInterval === 'day';

	return (
		<div className="billing-details">
			<Card compact className="billing-details__header">
				<div className="billing-details__row">
					<div>{ translate( 'Products' ) }</div>
					<div>{ translate( 'Assigned licenses' ) }</div>
					<div>{ translate( 'Unassigned licenses' ) }</div>
					<div>{ billing.isSuccess && useDailyPrices && translate( 'Days in Total' ) }</div>
				</div>
			</Card>

			{ billing.isSuccess &&
				billing.data.products.map( ( product ) => (
					<Card compact key={ product.productSlug }>
						<div className="billing-details__row">
							<div className="billing-details__product">
								{ product.productName }
								<span className="billing-details__line-item-meta">
									{ useDailyPrices &&
										translate( 'Price per license per day: %(price)s', {
											args: { price: formatCurrency( product.productCost, 'USD' ) },
										} ) }

									{ ! useDailyPrices &&
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
								{ useDailyPrices &&
									// Translators: * designates a footnote explaining how we calculate the number of days.
									translate( '%(count)d Day*', '%(count)d Days*', {
										count: product.productQuantity,
										args: { count: product.productQuantity },
									} ) }

								{ ! useDailyPrices &&
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
					{ billing.isSuccess && ! useDailyPrices && (
						<>
							<span className="billing-details__total-label billing-details__line-item-meta">
								{ translate( 'Assigned licenses:' ) }
							</span>
							<span className="billing-details__line-item-meta">
								{ formatCurrency( billing.data.costs.assigned, 'USD' ) }
							</span>
						</>
					) }

					{ billing.isSuccess && ! useDailyPrices && (
						<>
							<span className="billing-details__total-label billing-details__line-item-meta">
								{ translate( 'Unassigned licenses:' ) }
							</span>
							<span className="billing-details__line-item-meta">
								{ formatCurrency( billing.data.costs.unassigned, 'USD' ) }
							</span>
						</>
					) }

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
				</div>
			</Card>

			{ billing.isSuccess && useDailyPrices && (
				<Card compact className="billing-details__footer">
					<small>
						* Estimate of the combined number of full days each license will be active for by the
						end of the current month, accounting for licenses that were newly issued or revoked.
					</small>
				</Card>
			) }
		</div>
	);
}
