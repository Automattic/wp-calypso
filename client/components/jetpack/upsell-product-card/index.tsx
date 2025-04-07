import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackSocialSlug,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { TranslateResult, useTranslate, formatCurrency } from 'i18n-calypso';
import { createElement, ReactNode, useMemo, useState } from 'react';
import { A4A_MARKETPLACE_CHECKOUT_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import BackupImage from 'calypso/assets/images/jetpack/rna-image-backup.png';
import DefaultImage from 'calypso/assets/images/jetpack/rna-image-default.png';
import ScanImage from 'calypso/assets/images/jetpack/rna-image-scan.png';
import SearchImage from 'calypso/assets/images/jetpack/rna-image-search.png';
import SocialImage from 'calypso/assets/images/jetpack/rna-image-social.png';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import QueryJetpackPartnerKey from 'calypso/components/data/query-jetpack-partner-portal-partner-key';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import SingleSiteUpsellLightbox from 'calypso/jetpack-cloud/sections/partner-portal/single-site-upsell-lightbox';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { getPurchaseURLCallback } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import productAboveButtonText from 'calypso/my-sites/plans/jetpack-plans/product-card/product-above-button-text';
import productTooltip from 'calypso/my-sites/plans/jetpack-plans/product-card/product-tooltip';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import {
	getCurrentPartner,
	hasJetpackPartnerAccess as hasJetpackPartnerAccessSelector,
} from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getSiteAvailableProduct } from 'calypso/state/sites/products/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import UnusedLicenseNotice from '../unassigned-license-notice';
import type {
	Duration,
	SelectorProduct,
	SiteProduct,
} from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

interface UpsellProductCardProps {
	featureType: string;
	nonManageProductSlug: string;
	siteId: number | null;
	onCtaButtonClick: () => void;
}

const UpsellProductCard: React.FC< UpsellProductCardProps > = ( {
	featureType,
	nonManageProductSlug,
	siteId,
	onCtaButtonClick,
} ) => {
	const translate = useTranslate();
	const [ showLightbox, setShowLightbox ] = useState( false );
	const hasJetpackPartnerAccess = useSelector( hasJetpackPartnerAccessSelector );
	const nonManageCurrencyCode = useSelector( getCurrentUserCurrencyCode );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const partner = useSelector( getCurrentPartner );
	const item = slugToSelectorProduct( nonManageProductSlug ) as SelectorProduct;
	const siteProduct: SiteProduct | undefined = useSelector( ( state ) =>
		getSiteAvailableProduct( state, siteId, item.productSlug )
	);
	const isA4AEnabled = isA8CForAgencies();

	let aboveButtonText: TranslateResult | null;
	let billingTerm: Duration;
	let ctaButtonURL: string | undefined;
	let currencyCode: string | null;
	let discountedPrice: number | undefined;
	let discountText: TranslateResult | undefined;
	let isFetchingPrices: boolean;
	let manageProduct: APIProductFamilyProduct | undefined;
	let nonManageProductPrice: number | null = null;
	let onCtaButtonClickInternal = onCtaButtonClick;
	let originalPrice: number;
	let tooltipText: TranslateResult | ReactNode;

	// Calculate the product price.
	const {
		originalPrice: nonManageOriginalPrice,
		originalPriceTotal: nonManageOriginalPriceTotal,
		discountedPrice: nonManageDiscountedPrice,
		discountedPriceTotal: nonManageDiscountedPriceTotal,
		priceTierList: nonManagePriceTierList,
		isFetching: isFetchingNonManagePrices,
	} = useItemPrice( siteId, item, item?.monthlyProductSlug || '' );

	const { data: products, isFetching: isFetchingManagePrices } = useProductsQuery();

	if ( hasJetpackPartnerAccess ) {
		const manageProductSlug = nonManageProductSlug.replace( '_yearly', '' ).replace( /_/g, '-' );
		manageProduct = products?.find( ( product ) => product.slug === manageProductSlug );
		isFetchingPrices = isFetchingManagePrices || !! isFetchingNonManagePrices;
		if ( manageProduct ) {
			aboveButtonText = null;
			billingTerm = TERM_MONTHLY;
			ctaButtonURL = '#';
			currencyCode = manageProduct.currency;
			originalPrice = parseFloat( manageProduct.amount );

			if (
				manageProductSlug === 'jetpack-search' &&
				nonManagePriceTierList[ 0 ]?.transform_quantity_divide_by
			) {
				tooltipText = translate(
					'{{p}}%(price)s per every additional %(thousands_of_records)dk records and/or requests per month{{/p}}',
					{
						args: {
							price: formatCurrency( originalPrice, currencyCode ),
							thousands_of_records: nonManagePriceTierList[ 0 ].transform_quantity_divide_by / 1000,
						},
						comment:
							'price = formatted price per given number of records. thousands_of_records = number of records divided by 1000 (hence the k after it) See https://jetpack.com/upgrade/search/.',
						components: { p: createElement( 'p' ) },
					}
				);
			}
			onCtaButtonClickInternal = () => {
				onCtaButtonClick();
				if ( isA4AEnabled ) {
					page.redirect(
						`${ A4A_MARKETPLACE_CHECKOUT_LINK }?product_slug=${ manageProductSlug }&source=sitesdashboard&site_id=${ siteId }`
					);
					return;
				}
				setShowLightbox( true );
			};
		}
	} else {
		const getButtonURL = getPurchaseURLCallback( selectedSiteSlug || '', {
			// We want to redirect back here after checkout.
			redirect_to: window.location.href,
		} );

		// For Jetpack Search - ie. "*estimated price based off of {number} records"
		aboveButtonText = productAboveButtonText( item, siteProduct, false, false );
		billingTerm = TERM_ANNUALLY;
		ctaButtonURL = getButtonURL( item, false );
		currencyCode = nonManageCurrencyCode;
		discountedPrice = nonManageDiscountedPrice;
		isFetchingPrices = !! isFetchingNonManagePrices;
		originalPrice = nonManageOriginalPrice;

		if ( nonManagePriceTierList.length > 0 ) {
			tooltipText = productTooltip( item, nonManagePriceTierList, currencyCode ?? 'USD' );
		}

		if ( nonManageOriginalPrice !== undefined && nonManageDiscountedPrice !== undefined ) {
			const percentDiscount = Math.floor(
				( ( nonManageOriginalPrice - nonManageDiscountedPrice ) / nonManageOriginalPrice ) * 100
			);
			if ( !! percentDiscount && percentDiscount > 0 ) {
				discountText = translate( '%(percent)d%% off', {
					args: {
						percent: percentDiscount,
					},
					comment: 'Should be as concise as possible.',
				} );
			}
		}
	}

	if ( nonManageCurrencyCode === 'USD' ) {
		if ( nonManageDiscountedPriceTotal ) {
			nonManageProductPrice = nonManageDiscountedPriceTotal;
		} else if ( nonManageOriginalPriceTotal ) {
			nonManageProductPrice = nonManageOriginalPriceTotal;
		}
	}

	const ctaButtonLabel = translate( 'Add Jetpack %(productName)s', {
		args: {
			productName: item.displayName,
			context: 'The Jetpack product name, ie- Backup, Scan, Search, etc.',
		},
	} );

	const upsellImageAlt = translate( 'Buy Jetpack %(productName)s', {
		args: {
			productName: item.displayName,
			context: 'The Jetpack product name, ie- Backup, Scan, Search, etc.',
		},
		textOnly: true,
	} );
	const upsellImageUrl = useMemo( () => {
		if ( isJetpackBackupSlug( nonManageProductSlug ) ) {
			return BackupImage;
		}
		if ( isJetpackScanSlug( nonManageProductSlug ) ) {
			return ScanImage;
		}
		if ( isJetpackSearchSlug( nonManageProductSlug ) ) {
			return SearchImage;
		}
		if ( isJetpackSocialSlug( nonManageProductSlug ) ) {
			return SocialImage;
		}
		return DefaultImage;
	}, [ nonManageProductSlug ] );

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
				{ hasJetpackPartnerAccess && (
					<b>
						{ isA4AEnabled
							? translate( 'Price per license:' )
							: translate( 'Price per Jetpack Manage license:' ) }
					</b>
				) }
				<div className="upsell-product-card__price-container">
					<DisplayPrice
						isFree={ ! isFetchingPrices && originalPrice === 0 }
						discountedPrice={ discountedPrice }
						currencyCode={ currencyCode }
						originalPrice={ originalPrice ?? 0 }
						pricesAreFetching={ isFetchingPrices }
						belowPriceText={ item.belowPriceText }
						tooltipText={ tooltipText }
						billingTerm={ billingTerm }
						productName={ displayName }
						hideSavingLabel={ false }
					/>
					{ discountText && ! isFetchingPrices && (
						<div className="upsell-product-card__discount-label">{ discountText }</div>
					) }
				</div>
				{ aboveButtonText && (
					<p className="upsell-product-card__above-button">{ aboveButtonText }</p>
				) }
				{ showLightbox && hasJetpackPartnerAccess && siteId && manageProduct && (
					<SingleSiteUpsellLightbox
						manageProduct={ manageProduct }
						onClose={ () => setShowLightbox( false ) }
						nonManageProductSlug={ nonManageProductSlug }
						nonManageProductPrice={ nonManageProductPrice }
						partnerCanIssueLicense
						siteId={ siteId }
					/>
				) }
			</>
		);
	};

	return (
		<>
			{ hasJetpackPartnerAccess && <UnusedLicenseNotice featureType={ featureType } /> }
			<JetpackRnaActionCard
				headerText={ displayName }
				subHeaderText={ description }
				onCtaButtonClick={ onCtaButtonClickInternal }
				ctaButtonURL={ ctaButtonURL }
				ctaButtonLabel={ ctaButtonLabel }
				cardImage={ upsellImageUrl }
				cardImageAlt={ upsellImageAlt }
			>
				{ hasJetpackPartnerAccess && ! partner && <QueryJetpackPartnerPortalPartner /> }
				{ hasJetpackPartnerAccess && <QueryJetpackPartnerKey /> }
				{ renderProductCardBody() }
			</JetpackRnaActionCard>
		</>
	);
};

export default UpsellProductCard;

export const UpsellProductCardPlaceholder: React.FC = () => {
	return (
		<JetpackRnaActionCard
			headerText="Placeholder title"
			subHeaderText={ `This is placeholder text for the product description. The description text is
					approximately 18 words and 126 characters.` }
			ctaButtonLabel="Button label"
			isPlaceholder
		>
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
					pricesAreFetching
					billingTerm={ TERM_ANNUALLY }
					productName="Placeholder product"
				/>
			</div>
		</JetpackRnaActionCard>
	);
};
