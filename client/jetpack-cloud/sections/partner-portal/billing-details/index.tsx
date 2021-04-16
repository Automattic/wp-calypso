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

/**
 * Style dependencies
 */
import './style.scss';

export default function BillingDetails(): ReactElement {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const billing = {
		isSuccess: true,
		data: {
			date: '2021-03-01',
			costs: {
				total: 177916,
				assigned: 176644,
				unassigned: 1272,
			},
			products: [
				{
					productSlug: 'jetpack-backup-daily',
					productName: 'Jetpack Backup Daily',
					productCost: 17,
					counts: {
						assigned: 44,
						unassigned: 8,
						total: 52,
					},
					productTotalCost: 884,
				},
				{
					productSlug: 'jetpack-backup-realtime',
					productName: 'Jetpack Backup Real-time',
					productCost: 47,
					counts: {
						assigned: 22,
						unassigned: 4,
						total: 26,
					},
					productTotalCost: 1222,
				},
				{
					productSlug: 'jetpack-security-daily',
					productName: 'Jetpack Security Daily',
					productCost: 79,
					counts: {
						assigned: 0,
						unassigned: 12,
						total: 12,
					},
					productTotalCost: 948,
				},
				{
					productSlug: 'jetpack-complete',
					productName: 'Jetpack Complete',
					productCost: 139,
					counts: {
						assigned: 1258,
						unassigned: 0,
						total: 1258,
					},
					productTotalCost: 174862,
				},
			],
		},
	};

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

			<Card compact className="billing-details__footer">
				<div className="billing-details__row billing-details__row--summary">
					<span className="billing-details__total-label billing-details__cost-label">
						{ billing.isSuccess &&
							translate( 'Cost for {{bold}}%(date)s{{/bold}}', {
								components: { bold: <strong /> },
								args: { date: moment( billing.data.date ).format( 'MMMM, YYYY' ) },
							} ) }
					</span>
					<strong className="billing-details__cost-amount">
						{ billing.isSuccess && formatCurrency( billing.data.costs.total, 'USD' ) }
					</strong>

					<span className="billing-details__total-label billing-details__line-item-meta">
						{ translate( 'Assigned licenses:' ) }
					</span>
					<span className="billing-details__line-item-meta">
						{ billing.isSuccess && formatCurrency( billing.data.costs.assigned, 'USD' ) }
					</span>

					<span className="billing-details__total-label billing-details__line-item-meta">
						{ translate( 'Unassigned licenses:' ) }
					</span>
					<span className="billing-details__line-item-meta">
						{ billing.isSuccess && formatCurrency( billing.data.costs.unassigned, 'USD' ) }
					</span>
				</div>
			</Card>
		</div>
	);
}
