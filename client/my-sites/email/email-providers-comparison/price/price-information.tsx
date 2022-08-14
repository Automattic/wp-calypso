/* eslint-disable wpcalypso/jsx-classname-namespace */

import { isGoogleWorkspace, isTitanMail } from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import InfoPopover from 'calypso/components/info-popover';
import { formatPrice } from 'calypso/lib/gsuite/utils/format-price';
import useGetDomainIntroductoryOfferEligibility from 'calypso/my-sites/email/email-providers-comparison/price/use-get-domain-introductory-offer-eligibility';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
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

			<InfoPopover position="right" showOnHover>
				{ translate(
					'This discount is only available the first time you purchase an account. Any additional mailboxes purchased after that will be at the regular price.'
				) }
			</InfoPopover>
		</div>
	);
};

const FreeTrialPriceInformation = ( {
	product,
}: {
	product: ProductListItem;
} ): ReactElement | null => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const shouldProrate = product.introductory_offer?.should_prorate_when_offer_ends ?? false;

	const translateArguments = {
		args: {
			firstRenewalPrice: getFirstRenewalPrice( product, currencyCode ?? '' ),
			productTerm: product.product_term,
			standardPrice: formatCurrency( product.cost ?? 0, currencyCode ?? '', { stripZeros: true } ),
		},
		comment:
			"%(firstRenewalPrice)s and %(standardPrice)s are formatted prices with the currency (e.g. '$5'). %(productTerm)s is either month or year",
	};

	if ( shouldProrate ) {
		return (
			<div className="price-information__free-trial">
				{ translate(
					'Try free today - first renewal at %(firstRenewalPrice)s after trial, regular price %(standardPrice)s per %(productTerm)s',
					translateArguments
				) }
			</div>
		);
	}

	return (
		<div className="price-information__free-trial">
			{ translate(
				'Try free today - renews at %(standardPrice)s after trial',
				translateArguments
			) }
		</div>
	);
};

const IntroductoryOfferPriceInformation = ( { product }: { product: ProductListItem } ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const introductoryOffer = product.introductory_offer;
	const shouldProrate = introductoryOffer?.should_prorate_when_offer_ends ?? false;
	const transitionAfterRenewal = Number( introductoryOffer?.transition_after_renewal_count );

	const translateArguments = {
		args: {
			firstRenewalPrice: getFirstRenewalPrice( product, currencyCode ?? '' ),
			numberOfDiscountedRenewals: transitionAfterRenewal,
			productTerm: product.product_term,
			standardPrice: formatCurrency( product.cost ?? 0, currencyCode ?? '', { stripZeros: true } ),
		},
		comment:
			"%(firstRenewalPrice)s and %(standardPrice)s are formatted prices with the currency (e.g. '$5'). %(productTerm)s is either month or year",
	};

	if ( shouldProrate ) {
		return (
			<div className="price-information__free-trial">
				{ translate(
					'Discounted today - first renewal at %(firstRenewalPrice)s after trial, regular price %(standardPrice)s per %(productTerm)s',
					translateArguments
				) }
			</div>
		);
	}

	if ( transitionAfterRenewal > 0 ) {
		if ( transitionAfterRenewal === 1 ) {
			return (
				<div className="price-information__free-trial">
					{ translate(
						'Discounted today and the first renewal, regular price %(standardPrice)s per %(productTerm)s',
						translateArguments
					) }
				</div>
			);
		}

		return (
			<div className="price-information__free-trial">
				{ translate(
					'Discounted today and the next %(numberOfDiscountedRenewals)d renewals, regular price %(standardPrice)s per %(productTerm)s',
					translateArguments
				) }
			</div>
		);
	}

	return (
		<div className="price-information__free-trial">
			{ translate(
				'Discounted today - renews at %(standardPrice)s after trial',
				translateArguments
			) }
		</div>
	);
};

const PriceInformation = ( {
	domain,
	isDomainInCart = false,
	product,
}: {
	domain?: ResponseDomain;
	isDomainInCart?: boolean;
	product: ProductListItem | null;
} ): ReactElement | null => {
	const { isEligibleForIntroductoryOffer, isEligibleForIntroductoryOfferFreeTrial } =
		useGetDomainIntroductoryOfferEligibility( {
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

	const isDiscounted = hasDiscount( product );

	if ( isDiscounted && ! isEligibleForIntroductoryOffer ) {
		return <DiscountPriceInformation product={ product } />;
	}

	if ( isEligibleForIntroductoryOfferFreeTrial ) {
		return <FreeTrialPriceInformation product={ product } />;
	}

	if ( ! isEligibleForIntroductoryOffer ) {
		return null;
	}

	return <IntroductoryOfferPriceInformation product={ product } />;
};

export default PriceInformation;
