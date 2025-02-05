import { useTranslate, numberFormat } from 'i18n-calypso';
import wpcomIcon from 'calypso/assets/images/icons/wordpress-logo.svg';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { useLicenseLightboxData } from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox/hooks/use-license-lightbox-data';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import getPressablePlan from '../pressable-overview/lib/get-pressable-plan';
import type { ShoppingCartItem } from '../types';

export default function ProductInfo( {
	product,
	isAutomatedReferrals,
}: {
	product: ShoppingCartItem;
	isAutomatedReferrals?: boolean;
} ) {
	const translate = useTranslate();

	const { title, product: productInfo } = useLicenseLightboxData( product );

	let productIcon =
		productInfo?.productSlug && getProductIcon( { productSlug: productInfo?.productSlug } );
	let productTitle = title;
	let productDescription = productInfo?.lightboxDescription || productInfo?.tagline;
	let siteUrls;

	if ( product.family_slug === 'pressable-hosting' ) {
		const presablePlan = getPressablePlan( product.slug );
		if ( ! presablePlan ) {
			return null;
		}

		productIcon = pressableIcon;
		productTitle = product.name;
		productDescription = translate(
			'Plan with %(install)d WordPress install, %(visits)s visits per month, and %(storage)dGB of storage per month.',
			'Plan with %(install)d WordPress installs, %(visits)s visits per month, and %(storage)dGB of storage per month.',
			{
				args: {
					install: presablePlan.install,
					visits: numberFormat( presablePlan.visits ),
					storage: presablePlan.storage,
				},
				count: presablePlan.install,
				comment:
					'The `install`, `visits` & `storage` are the count of WordPress installs, visits per month, and storage per month in the plan description.',
			}
		);
	}

	if ( product.family_slug === 'wpcom-hosting' ) {
		productIcon = wpcomIcon;
		// TODO: We are removing Creator's product name in the frontend because we want to leave it in the backend for the time being,
		//       We have to refactor this once we have updates. Context: p1714663834375719-slack-C06JY8QL0TU
		productTitle =
			product.slug === 'wpcom-hosting-business' ? translate( 'WordPress.com Site' ) : product.name;
		productDescription = translate(
			'Plan with %(install)d managed WordPress install, with 50GB of storage.',
			'Plan with %(install)d managed WordPress installs, with 50GB of storage each.',
			{
				args: {
					install: product.quantity,
				},
				count: product.quantity,
				comment: 'The `install` are the count of WordPress installs.',
			}
		);

		const formattedSiteUrls = product.siteUrls?.map( ( siteUrl ) =>
			siteUrl.replace( /^https?:\/\//, '' )
		);

		siteUrls = product.siteUrls?.length
			? translate( 'Site: %(sitesList)s', 'Sites: %(sitesList)s', {
					count: product.siteUrls.length,
					args: {
						sitesList: formattedSiteUrls?.join( ',' ) ?? '',
					},
					context: 'site URLs in the plan description',
					comment: 'The `sitesList` is the list of site URLs in the plan description.',
			  } )
			: '';
	}

	if ( ! productDescription ) {
		return null;
	}
	const countInfo =
		product.family_slug === 'wpcom-hosting'
			? translate( '%(numLicenses)d site', '%(numLicenses)d sites', {
					context: 'button label',
					count: product.quantity,
					args: {
						numLicenses: product.quantity,
					},
			  } )
			: translate( '%(numLicenses)d plan', '%(numLicenses)d plans', {
					context: 'button label',
					count: product.quantity,
					args: {
						numLicenses: product.quantity,
					},
			  } );

	return (
		<div className="product-info">
			<div className="product-info__icon">
				<img src={ productIcon } alt={ title } />
			</div>
			<div className="product-info__text-content">
				<div className="product-info__header">
					<label htmlFor={ productTitle } className="product-info__label">
						{ productTitle }
					</label>
					<span className="product-info__count">{ countInfo }</span>
				</div>
				<p className="product-info__description">{ productDescription }</p>
				{
					// Show pressable limit warning if the product is a Pressable plan and it's not a referral
					product.family_slug === 'pressable-hosting' && ! isAutomatedReferrals && (
						<div className="product-info__pressable-limit-warning">
							{ translate(
								"*If you exceed your plan's storage or traffic limits, you will be charged $0.50 per GB and $8 per 10K visits per month."
							) }
						</div>
					)
				}
				{ product.licenseId && siteUrls && <p className="product-info__site-url">{ siteUrls }</p> }
			</div>
		</div>
	);
}
