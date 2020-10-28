/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { isFinite } from 'lodash';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackProductSlideOutCard from 'calypso/components/jetpack/card/jetpack-product-slide-out-card';
import useItemPrice from 'calypso/my-sites/plans-v2/use-item-price';
import { durationToText } from 'calypso/my-sites/plans-v2/utils';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback, SelectorProduct } from 'calypso/my-sites/plans-v2/types';

type Props = {
	product: SelectorProduct | null;
	productBillingTerm: Duration;
	onProductClick: PurchaseCallback;
};

const FeaturesProductSlideOut: FunctionComponent< Props > = ( {
	product,
	productBillingTerm,
	onProductClick,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();

	// Calculate the product price.
	const { originalPrice, discountedPrice } = useItemPrice(
		siteId,
		product,
		product?.monthlyProductSlug || ''
	);
	const isDiscounted = isFinite( discountedPrice );
	const productPrice = isDiscounted ? discountedPrice : originalPrice;

	const billingTimeFrame = durationToText( productBillingTerm );

	const slideOutButtonLabel = translate( 'Get {{name/}} $%(price)s', {
		args: {
			price: productPrice,
		},
		components: {
			name: <>{ product?.displayName }</>,
		},
	} );

	return product ? (
		<JetpackProductSlideOutCard
			iconSlug={ product.iconSlug }
			productName={ product.displayName }
			currencyCode={ currencyCode }
			price={ productPrice }
			billingTimeFrame={ billingTimeFrame }
			description={ product?.description }
			buttonLabel={ slideOutButtonLabel }
			onButtonClick={ () => onProductClick( product, false ) }
		/>
	) : null;
};

export default FeaturesProductSlideOut;
