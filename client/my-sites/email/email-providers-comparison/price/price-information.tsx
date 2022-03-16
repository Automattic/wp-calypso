/* eslint-disable wpcalypso/jsx-classname-namespace */

import { isGoogleWorkspace, isTitanMail } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import InfoPopover from 'calypso/components/info-popover';
import {
	getGoogleMailServiceFamily,
	isDomainEligibleForGoogleWorkspaceFreeTrial,
} from 'calypso/lib/gsuite';
import { formatPrice } from 'calypso/lib/gsuite/utils/format-price';
import { isDomainEligibleForTitanFreeTrial, isTitanMonthlyProduct } from 'calypso/lib/titan';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { ReactElement } from 'react';

import './style.scss';

const getFirstRenewalPrice = ( product: ProductListItem, currencyCode: string ): string | null => {
	if ( isGoogleWorkspace( product ) ) {
		return formatCurrency( ( ( product.cost ?? 0 ) * 11 ) / 12, currencyCode, {
			stripZeros: true,
		} );
	}

	if ( isTitanMail( product ) ) {
		return formatCurrency( ( ( product.cost ?? 0 ) * 9 ) / 12, currencyCode, { stripZeros: true } );
	}

	return null;
};

const DiscountPriceInformation = ( { product }: { product: ProductListItem } ): ReactElement => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	return (
		<div className="price-information__discount">
			{ translate( 'Pay only %(discountedPrice)s today - renews at %(standardPrice)s', {
				args: {
					discount: product.sale_coupon?.discount,
					discountedPrice: formatPrice( product.sale_cost ?? 0, currencyCode ?? '' ),
					standardPrice: formatPrice( product.cost ?? 0, currencyCode ?? '' ),
				},
				comment:
					"%(discount)d is a numeric percentage discount (e.g. '50'), " +
					"%(discountedPrice)s and %(standardPrice)s are formatted prices with the currency (e.g. '$5')",
			} ) }

			{ isGoogleWorkspace( product ) && (
				<InfoPopover position="right" showOnHover>
					{ translate(
						'This discount is only available the first time you purchase a %(googleMailService)s account, any additional mailboxes purchased after that will be at the regular price.',
						{
							args: {
								googleMailService: getGoogleMailServiceFamily( product.product_slug ),
							},
							comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
						}
					) }
				</InfoPopover>
			) }
		</div>
	);
};

const FreeTrialPriceInformation = ( {
	product,
}: {
	product: ProductListItem;
} ): ReactElement | null => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const translateArguments = {
		args: {
			firstRenewalPrice: getFirstRenewalPrice( product, currencyCode ?? '' ),
			standardPrice: formatCurrency( product.cost ?? 0, currencyCode ?? '', { stripZeros: true } ),
		},
		comment:
			"%(firstRenewalPrice)s and %(standardPrice)s are formatted prices with the currency (e.g. '$5')",
	};

	if ( isGoogleWorkspace( product ) ) {
		return (
			<div className="price-information__free-trial">
				{ translate(
					'Try it for free today - renews at %(firstRenewalPrice)s in one month, and then at %(standardPrice)s every year',
					translateArguments
				) }
			</div>
		);
	}

	if ( isTitanMail( product ) ) {
		if ( isTitanMonthlyProduct( product ) ) {
			return (
				<div className="price-information__free-trial">
					{ translate(
						'Try it for free today - renews at %(standardPrice)s in three months',
						translateArguments
					) }
				</div>
			);
		}

		return (
			<div className="price-information__free-trial">
				{ translate(
					'Try it for free today - renews at %(firstRenewalPrice)s in three months, and then at %(standardPrice)s every year',
					translateArguments
				) }
			</div>
		);
	}

	return null;
};

const PriceInformation = ( {
	domain,
	product,
}: {
	domain: SiteDomain;
	product: ProductListItem | null;
} ): ReactElement | null => {
	if ( ! product ) {
		return null;
	}

	if ( isGoogleWorkspace( product ) && hasDiscount( product ) ) {
		return <DiscountPriceInformation product={ product } />;
	}

	if (
		( isGoogleWorkspace( product ) && isDomainEligibleForGoogleWorkspaceFreeTrial( domain ) ) ||
		( isTitanMail( product ) && isDomainEligibleForTitanFreeTrial( domain ) )
	) {
		return <FreeTrialPriceInformation product={ product } />;
	}

	return null;
};

export default PriceInformation;
