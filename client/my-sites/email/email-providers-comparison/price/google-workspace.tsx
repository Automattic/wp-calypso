/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import InfoPopover from 'calypso/components/info-popover';
import {
	getGoogleMailServiceFamily,
	hasGSuiteSupportedDomain,
	isDomainEligibleForGoogleWorkspaceFreeTrial,
} from 'calypso/lib/gsuite';
import { formatPrice } from 'calypso/lib/gsuite/utils/format-price';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { ReactElement } from 'react';

import './style.scss';

const getGoogleWorkspaceProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
		: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
};

const AdditionalPriceInformation = ( {
	currencyCode,
	product,
}: {
	currencyCode: string | null;
	product: ProductListItem | null;
} ): ReactElement | null => {
	if ( ! hasDiscount( product ) ) {
		return null;
	}

	const standardPrice = formatPrice( product?.cost ?? 0, currencyCode ?? '' );
	const discountedPrice = formatPrice( product?.sale_cost ?? 0, currencyCode ?? '' );

	return (
		<div className="google-workspace-price__discount">
			{ translate(
				'%(discount)d%% off{{span}}, %(discountedPrice)s billed today, renews at %(standardPrice)s{{/span}}',
				{
					args: {
						discount: product?.sale_coupon?.discount,
						discountedPrice,
						standardPrice,
					},
					comment:
						"%(discount)d is a numeric percentage discount (e.g. '50'), " +
						"%(discountedPrice)s is a formatted, discounted price that the user will pay today (e.g. '$3'), " +
						"%(standardPrice)s is a formatted price (e.g. '$5')",
					components: {
						span: <span />,
					},
				}
			) }

			<InfoPopover position="right" showOnHover>
				{ translate(
					'This discount is only available the first time you purchase a %(googleMailService)s account, any additional mailboxes purchased after that will be at the regular price.',
					{
						args: {
							googleMailService: getGoogleMailServiceFamily( product?.product_slug ),
						},
						comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
					}
				) }
			</InfoPopover>
		</div>
	);
};

type GoogleWorkspacePriceProps = {
	domain: SiteDomain | undefined;
	isDomainInCart?: boolean;
	intervalLength: IntervalLength;
};

const GoogleWorkspacePrice = ( {
	domain,
	intervalLength,
	isDomainInCart = false,
}: GoogleWorkspacePriceProps ): JSX.Element | null => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const productSlug = getGoogleWorkspaceProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );

	if ( ! domain && ! isDomainInCart ) {
		return null;
	}

	const isGSuiteSupported =
		canPurchaseGSuite && ( isDomainInCart || hasGSuiteSupportedDomain( [ domain ] ) );

	if ( ! isGSuiteSupported ) {
		return (
			<div className="google-workspace-price__unavailable">
				{ translate( 'Not available for this domain name' ) }
			</div>
		);
	}

	if ( intervalLength === IntervalLength.MONTHLY ) {
		return (
			<div className="google-workspace-price__unavailable">
				{ translate( 'Only available with annual billing' ) }
			</div>
		);
	}

	const isDiscounted = hasDiscount( product );

	const priceWithInterval = (
		<PriceWithInterval
			cost={ product?.cost ?? 0 }
			currencyCode={ currencyCode ?? '' }
			hasDiscount={ isDiscounted }
			intervalLength={ intervalLength }
			sale={ product?.sale_cost ?? null }
		/>
	);

	const additionalPriceInformation = (
		<AdditionalPriceInformation currencyCode={ currencyCode } product={ product } />
	);

	return (
		<>
			{ isDomainEligibleForGoogleWorkspaceFreeTrial( domain ) && ! isDiscounted && (
				<div className="google-workspace-price__trial badge badge--info-green">
					{ translate( '1 month free' ) }
				</div>
			) }

			<PriceBadge
				additionalPriceInformation={ additionalPriceInformation }
				price={ priceWithInterval }
			/>
		</>
	);
};

export default GoogleWorkspacePrice;
