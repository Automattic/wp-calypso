/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import InfoPopover from 'calypso/components/info-popover';
import { hasGSuiteSupportedDomain, getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { formatPrice } from 'calypso/lib/gsuite/utils/format-price';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { ReactElement } from 'react';

import './style.scss';

const getGoogleWorkspaceProductSlug = ( intervalLength: IntervalLength ): string => {
	return intervalLength === IntervalLength.MONTHLY
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
		: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY;
};

type GoogleWorkspacePriceProps = {
	domain: SiteDomain | undefined;
	intervalLength: IntervalLength;
};

const GoogleWorkspacePrice = ( {
	domain,
	intervalLength,
}: GoogleWorkspacePriceProps ): ReactElement => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const productSlug = getGoogleWorkspaceProductSlug( intervalLength );
	const product = useSelector( ( state ) => getProductBySlug( state, productSlug ) );

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );

	if ( ! domain ) {
		return <></>;
	}

	const isGSuiteSupported = canPurchaseGSuite && hasGSuiteSupportedDomain( [ domain ] );

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

	const productIsDiscounted = hasDiscount( product );

	const standardPriceForIntervalLength = formatPrice( product?.cost ?? 0, currencyCode ?? '' );
	const salePriceForIntervalLength = formatPrice( product?.sale_cost ?? 0, currencyCode ?? '' );

	const discount = productIsDiscounted ? (
		<div className="google-workspace-price__discount">
			{ translate(
				'%(discount)d%% off{{span}}, %(discountedPrice)s billed today, renews at %(standardPrice)s{{/span}}',
				{
					args: {
						discount: product?.sale_coupon?.discount,
						discountedPrice: salePriceForIntervalLength,
						standardPrice: standardPriceForIntervalLength,
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
							googleMailService: getGoogleMailServiceFamily( productSlug ),
						},
						comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
					}
				) }
			</InfoPopover>
		</div>
	) : null;

	const priceWithInterval = (
		<PriceWithInterval
			cost={ product?.cost ?? 0 }
			currencyCode={ currencyCode ?? '' }
			hasDiscount={ productIsDiscounted }
			intervalLength={ intervalLength }
			sale={ product?.sale_cost ?? null }
		/>
	);

	return (
		<PriceBadge
			additionalPriceInformationComponent={ discount }
			priceComponent={ priceWithInterval }
		/>
	);
};

export default GoogleWorkspacePrice;
