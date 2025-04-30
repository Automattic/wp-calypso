import { isGoogleWorkspace, isTitanMail } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useTranslate } from 'i18n-calypso';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import InfoPopover from 'calypso/components/info-popover';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { isTitanMonthlyProduct } from 'calypso/lib/titan';
import useGetDomainIntroductoryOfferEligibilities from 'calypso/my-sites/email/email-providers-comparison/price/use-get-domain-introductory-offer-eligibilities';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

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

const DiscountPriceInformation = ( {
	isEligibleForIntroductoryOffer,
	product,
}: {
	isEligibleForIntroductoryOffer: boolean;
	product: ProductListItem;
} ) => {
	const translate = useTranslate();

	return (
		<div className="price-information__discount">
			{ translate( 'Enjoy first year subscription at the discounted price' ) }

			{ isGoogleWorkspace( product ) && ! isEligibleForIntroductoryOffer && (
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

export const FreeTrialPriceInformation = ( {
	className = 'price-information__free-trial',
	product,
}: {
	className?: string;
	product: ProductListItem;
} ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();

	const translateArguments = {
		args: {
			firstRenewalPrice: getFirstRenewalPrice( product, currencyCode ?? '' ) as string,
			standardPrice: formatCurrency( product.cost ?? 0, currencyCode ?? '', { stripZeros: true } ),
		},
		comment:
			"%(firstRenewalPrice)s and %(standardPrice)s are formatted prices with the currency (e.g. '$5')",
	};

	if ( isGoogleWorkspace( product ) || ! isTitanMonthlyProduct( product ) ) {
		return (
			<div className={ className }>
				{ translate(
					'Try free today - first renewal at %(firstRenewalPrice)s after trial, regular price %(standardPrice)s per year',
					translateArguments
				) }
			</div>
		);
	}

	if ( isTitanMonthlyProduct( product ) ) {
		return (
			<div className={ className }>
				{ translate(
					'Try free today - renews at %(standardPrice)s after trial',
					translateArguments
				) }
			</div>
		);
	}

	return null;
};

const PriceInformation = ( {
	domain,
	isDomainInCart = false,
	product,
}: {
	domain?: ResponseDomain;
	isDomainInCart?: boolean;
	product: ProductListItem | null;
} ) => {
	const { isEligibleForIntroductoryOffer, isEligibleForIntroductoryOfferFreeTrial } =
		useGetDomainIntroductoryOfferEligibilities( {
			domain,
			isDomainInCart,
			product,
		} );

	if ( ! product ) {
		return null;
	}

	if ( ! isGoogleWorkspace( product ) && ! isTitanMail( product ) ) {
		return null;
	}

	if ( isEligibleForIntroductoryOfferFreeTrial ) {
		return <FreeTrialPriceInformation product={ product } />;
	}

	if ( hasDiscount( product ) || isEligibleForIntroductoryOffer ) {
		return (
			<DiscountPriceInformation
				product={ product }
				isEligibleForIntroductoryOffer={ isEligibleForIntroductoryOffer }
			/>
		);
	}

	return null;
};

export default PriceInformation;
