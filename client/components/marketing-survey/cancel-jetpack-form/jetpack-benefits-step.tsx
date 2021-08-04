/**
 * External Dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import {
	isJetpackPlanSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackSearch,
} from '@automattic/calypso-products';

import { getProductBySlug } from 'calypso/state/products-list/selectors';
import JetpackBenefits from 'calypso/blocks/jetpack-benefits';
import JetpackGeneralBenefits from 'calypso/blocks/jetpack-benefits/general-benefits';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

interface Props {
	siteId: number;
	purchase: Purchase;
	productSlug: string;
}

const JetpackBenefitsStep: React.FC< Props > = ( props ) => {
	const translate = useTranslate();
	const { purchase, productSlug, siteId } = props;
	const product = useSelector( ( state ) =>
		getProductBySlug( state, productSlug )
	) as ResponseCartProduct | null;

	const getTimeRemainingForSubscription = ( purchase: Purchase ) => {
		const purchaseExpiryDate = moment( purchase.expiryDate );

		return moment.duration( purchaseExpiryDate.diff( moment( purchase.mostRecentRenewDate ) ) );
	};

	const getTimeRemainingTranslatedPeriod = ( purchase: Purchase ) => {
		const timeRemaining = getTimeRemainingForSubscription( purchase );

		if ( timeRemaining.months() >= 1 ) {
			const timeRemainingNumber = timeRemaining.months();
			const periodName = translate( 'month', 'months', { count: timeRemaining.months() } );

			return { timeRemainingNumber, periodName };
		} else if ( timeRemaining.weeks() >= 1 ) {
			const timeRemainingNumber = timeRemaining.weeks();
			const periodName = translate( 'week', 'weeks', { count: timeRemainingNumber } );

			return { timeRemainingNumber, periodName };
		}

		const timeRemainingNumber = timeRemaining.days();
		const periodName = translate( 'day', 'days', { count: timeRemainingNumber } );

		return { timeRemainingNumber, periodName };
	};

	const renderTimeRemainingString = ( product: ResponseCartProduct | null, purchase: Purchase ) => {
		// returns early if there's no product or accounting for the edge case that the plan expires today (or somehow already expired)
		// in this case, do not show the time remaining for the plan
		const timeRemaining = getTimeRemainingForSubscription( purchase );
		if ( null === product || timeRemaining.days() <= 1 ) {
			return null;
		}

		// if this product/ plan is partner managed, it won't really "expire" from the user's perspective
		if ( isPartnerPurchase( purchase ) || ! purchase.expiryDate ) {
			return (
				<React.Fragment>
					{ translate(
						'Your {{strong}} %(productName)s {{/strong}} subscription is still active. {{br/}}',
						{
							args: { productName: product.product_name },
							components: {
								strong: <strong />,
								br: <br />,
							},
						}
					) }
				</React.Fragment>
			);
		}

		const translatedPeriod = getTimeRemainingTranslatedPeriod( purchase );

		// show how much time is left on the plan
		return (
			<React.Fragment>
				{ translate(
					'You still have {{strong}}%(timeRemaining)d %(period)s{{/strong}} left on your {{strong}}%(productName)s{{/strong}} subscription. {{br/}}',
					{
						args: {
							timeRemaining: translatedPeriod.timeRemainingNumber,
							period: translatedPeriod.periodName,
							productName: product.product_name,
						},
						components: {
							strong: <strong />,
							br: <br />,
						},
						comment:
							"'period' is either one of 'day', 'week', 'month', or their plural form. 'timeRemaining' is a number representing the time left that will be used with the 'period'.",
					}
				) }
			</React.Fragment>
		);
	};

	const getCancelConsequenceByProduct = ( productSlug: string ) => {
		if ( isJetpackScanSlug( productSlug ) ) {
			return translate(
				'Once you cancel your site will no longer have automatic protection from threats.'
			);
		} else if ( isJetpackBackupSlug( productSlug ) ) {
			return translate( 'Once you cancel you will lose access to your site backups.' );
		} else if ( isJetpackSearch( productSlug ) ) {
			return translate(
				"Once you cancel you will no longer have Jetpack's enhanced search experience."
			);
		}

		return translate( 'Once you cancel you will lose access to the following:' );
	};

	return (
		<React.Fragment>
			<div className="cancel-jetpack-form__section-header dialog__header">
				<h2 className="cancel-jetpack-form__step-headline jetpack-benefits__section-title">
					{ translate( 'Are you sure you want to cancel?' ) }
				</h2>
				<p className="cancel-jetpack-form__step-summary jetpack-benefits__section-description">
					{ renderTimeRemainingString( product, purchase ) }
					{ getCancelConsequenceByProduct( productSlug ) }
				</p>
			</div>

			<JetpackBenefits siteId={ siteId } productSlug={ productSlug } />

			{ isJetpackPlanSlug( productSlug ) && ( // show general benefits for plans
				<div className="cancel-jetpack-form__jetpack-general-benefits">
					<p className="cancel-jetpack-form__jetpack-general-benefits-title">
						{ translate( 'Additionally, you will loose access to:' ) }
					</p>
					<JetpackGeneralBenefits productSlug={ productSlug } />
				</div>
			) }
		</React.Fragment>
	);
};

export default JetpackBenefitsStep;
