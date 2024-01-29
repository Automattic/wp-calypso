import { Button } from '@automattic/components';
import { Icon, plugins, cloud } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import getAPIFamilyProductIcon from 'calypso/jetpack-cloud/sections/manage/pricing/utils/get-api-family-product-icon';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';

type SimpleLicenseItemCardProps = {
	item: APIProductFamilyProduct;
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	moreInfoLink?: React.ReactNode;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
};

export const SimpleLicenseItemCard = ( {
	item,
	bundleSize,
	ctaAsPrimary,
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: SimpleLicenseItemCardProps ) => {
	const translate = useTranslate();

	const title = getProductShortTitle( item, false );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );

	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + item.name;
	const productSlug = item.slug;

	const getIssueLicenseURL = useCallback(
		( item: APIProductFamilyProduct, bundleSize: number | undefined ) => {
			if ( isLoggedIn ) {
				if ( isAgency ) {
					return addQueryArgs( `/partner-portal/issue-license/`, {
						product_slug: item.slug,
						source: 'manage-pricing-page',
						bundle_size: bundleSize,
					} );
				}
				return addQueryArgs( `/manage/signup/`, {
					product_slug: item.slug,
					source: 'manage-pricing-page',
					bundle_size: bundleSize,
				} );
			}
			return '#';
		},
		[ isLoggedIn, isAgency ]
	);

	let price = <ItemPrice bundleSize={ bundleSize } item={ item } />;
	if (
		item.name.startsWith( 'Jetpack VaultPress Backup Add-on' ) ||
		item.name.startsWith( 'WooCommerce' )
	) {
		price = <ItemPrice bundleSize={ 1 } item={ item } />;
	}
	const { description: productDescription } = useProductDescription( productSlug );

	let icon = null;

	if ( productSlug.startsWith( 'woocommerce' ) ) {
		icon = (
			<Icon
				className="woocommerce-extension-plugin-icon"
				icon={ plugins }
				width={ 24 }
				height={ 24 }
			/>
		);
	} else if ( productSlug.startsWith( 'jetpack-backup' ) ) {
		icon = (
			<Icon className="jetpack-backup-plugin-icon" icon={ cloud } width={ 28 } height={ 28 } />
		);
	} else {
		icon = (
			<img
				alt={ item.name + ' icon' }
				src={ getAPIFamilyProductIcon( { productSlug: item.slug } ) }
			/>
		);
	}
	return (
		<div className="simple-item-card">
			{ icon ? <div className="simple-item-card__icon">{ icon }</div> : null }
			<div className="simple-item-card__body">
				<div className="simple-item-card__header">
					<div>
						<h3 className="simple-item-card__title">{ title }</h3>
						<div className="simple-item-card__price">{ price }</div>
					</div>
					<Button
						className="simple-item-card__cta"
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						href={ isCtaDisabled ? '#' : getIssueLicenseURL( item, bundleSize ) }
						target={ isCtaExternal ? '_blank' : undefined }
						primary={ ctaAsPrimary }
						aria-label={ ctaAriaLabel }
					>
						{ ctaLabel }
					</Button>
				</div>
				<div className="simple-item-card__footer">
					{ productDescription }
					{ moreInfoLink }
				</div>
			</div>
		</div>
	);
};
