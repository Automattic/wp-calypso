import { Button } from '@automattic/components';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import { Icon, plugins, cloud } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import getAPIFamilyProductIcon from 'calypso/jetpack-cloud/sections/manage/pricing/utils/get-api-family-product-icon';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';

type SimpleLicenseItemCardProps = {
	item: APIProductFamilyProduct;
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	ctaHref?: string;
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
	ctaHref,
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: SimpleLicenseItemCardProps ) => {
	const translate = useTranslate();

	const title = getProductShortTitle( item, false );

	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + item.name;
	const productSlug = item.slug;

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
						href={ isCtaDisabled ? '#' : ctaHref }
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
