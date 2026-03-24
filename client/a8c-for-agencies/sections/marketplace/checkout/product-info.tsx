import { formatCurrency, formatNumberCompact } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import wpcomIcon from 'calypso/assets/images/icons/wordpress-logo.svg';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { VendorInfo } from 'calypso/components/jetpack/jetpack-lightbox/types';
import { useLicenseLightboxData } from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox/hooks/use-license-lightbox-data';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPressablePlan from '../pressable-overview/lib/get-pressable-plan';
import type { ShoppingCartItem } from '../types';

export default function ProductInfo( {
	product,
	isAutomatedReferrals,
	vendor,
}: {
	product: ShoppingCartItem;
	isAutomatedReferrals?: boolean;
	vendor?: VendorInfo | null;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { title, product: productInfo } = useLicenseLightboxData( product );

	const isWooCommerceProduct = product.slug.startsWith( 'woocommerce-' );
	const isPressableAddonProduct =
		product.family_slug === 'pressable-addon' || product.slug.startsWith( 'pressable-addon-' );

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
					visits: formatNumberCompact( presablePlan.visits ),
					storage: presablePlan.storage,
				},
				count: presablePlan.install,
				comment:
					'The `install`, `visits` & `storage` are the count of WordPress installs, visits per month, and storage per month in the plan description.',
			}
		);
	}

	if ( isPressableAddonProduct ) {
		const pressableAddonPlan = getPressablePlan( product.slug );

		productIcon = pressableIcon;
		productTitle = product.name;

		if ( pressableAddonPlan?.unit === 'inbox' ) {
			productDescription = translate(
				'Add %(inboxes)d Titan inbox to your Pressable plan.',
				'Add %(inboxes)d Titan inboxes to your Pressable plan.',
				{
					args: {
						inboxes: product.quantity,
					},
					count: product.quantity,
					comment: 'The `inboxes` is the number of Titan inboxes included in the add-on.',
				}
			);
		} else if ( pressableAddonPlan?.install ) {
			productDescription = translate(
				'Add %(install)d WordPress install, %(visits)s visits per month, and %(storage)dGB of storage to your Pressable plan.',
				'Add %(install)d WordPress installs, %(visits)s visits per month, and %(storage)dGB of storage to your Pressable plan.',
				{
					args: {
						install: pressableAddonPlan.install,
						visits: formatNumberCompact( pressableAddonPlan.visits ),
						storage: pressableAddonPlan.storage,
					},
					count: pressableAddonPlan.install,
					comment:
						'The `install`, `visits` & `storage` are added capacities for the Pressable add-on.',
				}
			);
		} else if ( pressableAddonPlan?.storage ) {
			productDescription = translate(
				'Add %(storage)dGB of storage capacity to your Pressable plan each month.',
				{
					args: {
						storage: pressableAddonPlan.storage,
					},
					comment: 'The `storage` is additional monthly storage from the Pressable add-on.',
				}
			);
		} else if ( pressableAddonPlan?.visits ) {
			productDescription = translate(
				'Add %(visits)s visits per month capacity to your Pressable plan.',
				{
					args: {
						visits: formatNumberCompact( pressableAddonPlan.visits ),
					},
					comment: 'The `visits` is additional monthly visits from the Pressable add-on.',
				}
			);
		}

		if ( ! productDescription ) {
			productDescription = translate(
				'Add-on that increases your Pressable plan limits while your plan is active.'
			);
		}
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
			{ isWooCommerceProduct ? (
				<img className="product-info__icon" src={ productIcon } alt={ productTitle } />
			) : (
				<div className="product-info__icon">
					<img src={ productIcon } alt={ productTitle } />
				</div>
			) }
			<div className="product-info__text-content">
				<div className="product-info__header">
					<label htmlFor={ productTitle } className="product-info__label">
						<h3>{ productTitle }</h3>
						{ vendor &&
							translate( 'By {{a/}}', {
								components: {
									a: (
										<a
											href={ vendor.vendorUrl }
											target="_blank"
											rel="noopener noreferrer"
											onClick={ () => {
												dispatch(
													recordTracksEvent( 'calypso_marketplace_products_overview_vendor_click', {
														vendor: vendor.vendorName,
													} )
												);
											} }
										>
											{ vendor.vendorName }
										</a>
									),
								},
							} ) }
					</label>
					{ ! isAutomatedReferrals && <span className="product-info__count">{ countInfo }</span> }
				</div>
				<p className="product-info__description">{ productDescription }</p>
				{
					// Show pressable limit warning if the product is a Pressable plan and it's not a referral
					product.family_slug === 'pressable-hosting' && ! isAutomatedReferrals && (
						<div className="product-info__pressable-limit-warning">
							{ translate(
								"*If you exceed your plan's storage or traffic limits, you will be charged %(storageCharge)s per GB and %(trafficCharge)s per %(visits)s visits per month.",
								{
									args: {
										storageCharge: formatCurrency( 0.5, 'USD', {
											stripZeros: true,
										} ),
										trafficCharge: formatCurrency( 8, 'USD', {
											stripZeros: true,
										} ),
										visits: formatNumberCompact( 10000 ),
									},
								}
							) }
						</div>
					)
				}
				{ product.licenseId && siteUrls && <p className="product-info__site-url">{ siteUrls }</p> }
			</div>
		</div>
	);
}
