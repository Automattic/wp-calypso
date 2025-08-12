import {
	JETPACK_SEARCH_PRODUCTS,
	isJetpackPlanSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackAntiSpamSlug,
	isJetpackSearchSlug,
	isJetpackBoostSlug,
	isJetpackVideoPressSlug,
	isAkismetProduct,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import JetpackBenefits from 'calypso/blocks/jetpack-benefits';
import JetpackGeneralBenefits from 'calypso/blocks/jetpack-benefits/general-benefits';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import type { Purchase } from 'calypso/lib/purchases/types';

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
	const moment = useLocalizedMoment();

	const getTimeRemainingForSubscription = ( purchase: Purchase ) => {
		const purchaseExpiryDate = moment.utc( purchase.expiryDate );

		return moment.duration( purchaseExpiryDate.diff( moment.utc() ) );
	};

	const getTimeRemainingTranslatedPeriod = ( purchase: Purchase ) => {
		const timeRemaining = getTimeRemainingForSubscription( purchase );

		if ( timeRemaining.months() >= 1 ) {
			const timeRemainingNumber = timeRemaining.months();
			const unitOfTime = translate( 'month', 'months', {
				count: timeRemainingNumber,
				context: 'unit of time',
			} );

			return { timeRemainingNumber, unitOfTime };
		} else if ( timeRemaining.weeks() > 1 ) {
			const timeRemainingNumber = timeRemaining.weeks();
			const unitOfTime = translate( 'week', 'weeks', {
				count: timeRemainingNumber,
				context: 'unit of time',
			} );

			return { timeRemainingNumber, unitOfTime };
		}

		const timeRemainingNumber = timeRemaining.days();
		const unitOfTime = translate( 'day', 'days', {
			count: timeRemainingNumber,
			context: 'unit of time',
		} );

		return { timeRemainingNumber, unitOfTime };
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
					'You still have {{strong}}%(timeRemaining)d %(unitOfTime)s{{/strong}} left on your {{strong}}%(productName)s{{/strong}} subscription. {{br/}}',
					{
						args: {
							timeRemaining: translatedPeriod.timeRemainingNumber,
							unitOfTime: translatedPeriod.unitOfTime,
							productName: product.product_name,
						},
						components: {
							strong: <strong />,
							br: <br />,
						},
						comment:
							"'unitOfTime' is either one of 'day', 'week', 'month', or their plural form. 'timeRemaining' is a number representing the time left that will be used with the 'unitOfTime'.",
					}
				) }
			</React.Fragment>
		);
	};

	const hasBenefitsToShow = ( productSlug: string ) => {
		return (
			isJetpackScanSlug( productSlug ) ||
			isJetpackBackupSlug( productSlug ) ||
			isJetpackAntiSpamSlug( productSlug ) ||
			isJetpackSearchSlug( productSlug ) ||
			isJetpackBoostSlug( productSlug ) ||
			isJetpackVideoPressSlug( productSlug ) ||
			isJetpackPlanSlug( productSlug )
		);
	};

	const getCancelConsequenceByProduct = ( productSlug: string ) => {
		if ( isJetpackScanSlug( productSlug ) ) {
			return translate(
				'Once you remove your subscription, your site will no longer have automatic protection from threats.'
			);
		} else if ( isJetpackBackupSlug( productSlug ) ) {
			return translate(
				'Once you remove your subscription, you will lose access to your site backups.'
			);
		} else if ( ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes( productSlug ) ) {
			return translate(
				"Once you remove your subscription, you will no longer have Jetpack's enhanced search experience."
			);
		} else if ( isAkismetProduct( { productSlug: productSlug } ) ) {
			return translate(
				"Once you remove your subscription, Akismet will no longer be blocking spam from your sites' comments and forms."
			);
		} else if ( hasBenefitsToShow( productSlug ) ) {
			return translate(
				'Once you remove your subscription, you will lose access to the following:'
			);
		}

		return '';
	};

	return (
		<React.Fragment>
			<FormattedHeader
				headerText={ translate( 'Are you sure you want to remove your subscription?' ) }
				subHeaderText={
					<React.Fragment>
						{ renderTimeRemainingString( product, purchase ) }
						{ getCancelConsequenceByProduct( productSlug ) }
					</React.Fragment>
				}
				align="center"
				isSecondary
			/>
			{ hasBenefitsToShow( productSlug ) && (
				<JetpackBenefits siteId={ siteId } productSlug={ productSlug } />
			) }
			{ isJetpackPlanSlug( productSlug ) && ( // show general benefits for plans
				<div className="cancel-jetpack-form__jetpack-general-benefits">
					<p className="cancel-jetpack-form__jetpack-general-benefits-title">
						{ translate( 'Additionally, you will lose access to:' ) }
					</p>
					<JetpackGeneralBenefits productSlug={ productSlug } />
				</div>
			) }
		</React.Fragment>
	);
};

export default JetpackBenefitsStep;
