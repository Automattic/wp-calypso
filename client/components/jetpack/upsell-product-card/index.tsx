import {
	TERM_ANNUALLY,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import BackupImage from 'calypso/assets/images/jetpack/rna-image-Backup.png';
import DefaultImage from 'calypso/assets/images/jetpack/rna-image-Default.png';
import ScanImage from 'calypso/assets/images/jetpack/rna-image-Scan.png';
import SearchImage from 'calypso/assets/images/jetpack/rna-image-Search.png';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-RNA-action-card';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import productAboveButtonText from 'calypso/my-sites/plans/jetpack-plans/product-card/product-above-button-text';
import productTooltip from 'calypso/my-sites/plans/jetpack-plans/product-card/product-tooltip';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { getSiteAvailableProduct } from 'calypso/state/sites/products/selectors';
import type {
	Duration,
	PurchaseURLCallback,
	SelectorProduct,
	SiteProduct,
} from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

interface UpsellProductCardProps {
	productSlug: string;
	siteId: number | null;
	currencyCode: string | null;
	onCtaButtonClick: () => void;
	getButtonURL?: PurchaseURLCallback;
	billingTerm?: Duration;
}

const UpsellProductCard: React.FC< UpsellProductCardProps > = ( {
	productSlug,
	siteId,
	currencyCode,
	getButtonURL,
	onCtaButtonClick,
	billingTerm = TERM_ANNUALLY,
} ) => {
	const translate = useTranslate();
	const item = slugToSelectorProduct( productSlug ) as SelectorProduct;
	const siteProduct: SiteProduct | undefined = useSelector( ( state ) =>
		getSiteAvailableProduct( state, siteId, item.productSlug )
	);

	// Calculate the product price.
	const {
		originalPrice,
		discountedPrice,
		priceTierList,
		isFetching: pricesAreFetching,
	} = useItemPrice( siteId, item, item?.monthlyProductSlug || '' );

	// For Jetpack Search - ie. "*estimated price based off of {number} records"
	const aboveButtonText = productAboveButtonText( item, siteProduct, false, false );

	const ctaButtonURL = getButtonURL && getButtonURL( item, false );
	const ctaButtonLabel = translate( 'Add Jetpack %(productName)s', {
		args: {
			productName: item.displayName,
			context: 'The Jetpack product name, ie- Backup, Scan, Search, etc.',
		},
	} );

	const percentDiscount =
		originalPrice !== undefined && discountedPrice !== undefined
			? Math.floor( ( ( originalPrice - discountedPrice ) / originalPrice ) * 100 )
			: 0;

	const showDiscountLabel = !! percentDiscount && percentDiscount > 0;
	const discountText = showDiscountLabel
		? translate( '%(percent)d%% off', {
				args: {
					percent: percentDiscount,
				},
				comment: 'Should be as concise as possible.',
		  } )
		: null;

	const upsellImageUrl = useMemo( () => {
		if ( isJetpackBackupSlug( productSlug ) ) {
			return BackupImage;
		}
		if ( isJetpackScanSlug( productSlug ) ) {
			return ScanImage;
		}
		if ( isJetpackSearchSlug( productSlug ) ) {
			return SearchImage;
		}
		return DefaultImage;
	}, [ productSlug ] );

	const { displayName, description, features } = item;

	const renderProductCardBody = () => {
		return (
			<>
				<ul className="upsell-product-card__features">
					{ features?.items &&
						features.items.map( ( item, i ) => (
							<li className="upsell-product-card__features-item" key={ i }>
								<>
									<Gridicon size={ 18 } icon="checkmark" /> { item.text }
								</>
							</li>
						) ) }
				</ul>
				<div className="upsell-product-card__price-container">
					<DisplayPrice
						discountedPrice={ discountedPrice }
						currencyCode={ currencyCode }
						originalPrice={ originalPrice ?? 0 }
						pricesAreFetching={ pricesAreFetching }
						belowPriceText={ item.belowPriceText }
						tooltipText={ priceTierList.length > 0 && productTooltip( item, priceTierList ) }
						billingTerm={ billingTerm }
						productName={ displayName }
						hideSavingLabel={ false }
					/>
					{ showDiscountLabel && ! pricesAreFetching && (
						<div className="upsell-product-card__discount-label">{ discountText }</div>
					) }
				</div>
				{ aboveButtonText && (
					<p className="upsell-product-card__above-button">{ aboveButtonText }</p>
				) }
			</>
		);
	};

	return (
		<JetpackRnaActionCard
			headerText={ displayName }
			subHeaderText={ description }
			onCtaButtonClick={ onCtaButtonClick }
			ctaButtonURL={ ctaButtonURL }
			ctaButtonLabel={ ctaButtonLabel }
			cardImage={ upsellImageUrl }
			cardImageAlt={ `Buy Jetpack ${ displayName }` }
		>
			{ renderProductCardBody() }
		</JetpackRnaActionCard>
	);
};

export default UpsellProductCard;

export const UpsellProductCardPlaceholder: React.FC = () => {
	return (
		<JetpackRnaActionCard
			headerText={ 'Placeholder title' }
			ctaButtonLabel={ 'Button label' }
			isPlaceholder
		>
			<p className="upsell-product-card__description">
				<span>
					This is placeholder text for the product description. The description text is
					approximately 18 words and 126 characters.
				</span>
			</p>

			<ul className="upsell-product-card__features">
				<li className="upsell-product-card__features-item" key={ 1 }>
					<span>Placeholder feature text 1</span>
				</li>
				<li className="upsell-product-card__features-item" key={ 2 }>
					<span>Placeholder feature text 2</span>
				</li>
				<li className="upsell-product-card__features-item" key={ 3 }>
					<span>Placeholder feature text 3</span>
				</li>
			</ul>

			<div className="upsell-product-card__price-container">
				<DisplayPrice
					pricesAreFetching={ true }
					billingTerm={ TERM_ANNUALLY }
					productName={ 'Placeholder product' }
				/>
			</div>
		</JetpackRnaActionCard>
	);
};
