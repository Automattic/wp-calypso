import { isEnabled } from '@automattic/calypso-config';
import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	JETPACK_AI_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	JETPACK_VIDEOPRESS_PRODUCTS,
	JETPACK_STATS_PRODUCTS,
	getPlan,
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	JETPACK_SOCIAL_V1_PRODUCTS,
} from '@automattic/calypso-products';
import { useSelector } from 'calypso/state';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import slugToSelectorProduct from './slug-to-selector-product';
import type { PlanGridProducts, SelectorProduct } from './types';

const useSelectorPageProducts = ( siteId: number | null ): PlanGridProducts => {
	// Available products are products that have not been purchased,
	// and are not included as part of an active subscription
	let availableProducts: string[] = [];

	// Products/features included in the current plan
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	const includedInPlanProducts: string[] =
		( currentPlan && getPlan( currentPlan )?.getIncludedFeatures?.() ) || [];

	// Owned products from direct purchases
	const purchasedProducts =
		useSelector( ( state ) => getSiteProducts( state, siteId ) )
			?.map( ( { productSlug } ) => productSlug )
			.filter( ( productSlug ) =>
				( [ ...JETPACK_PRODUCTS_LIST ] as ReadonlyArray< string > ).includes( productSlug )
			) ?? [];

	// Directly and indirectly owned products
	const ownedProducts = [ ...purchasedProducts, ...includedInPlanProducts ];

	// If Jetpack Search is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
		)
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_SEARCH_PRODUCTS ];
	}

	const backupProductsToShow: string[] = [];

	const ownsBackupT0 =
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T0_YEARLY ) ||
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T0_MONTHLY );
	const ownsBackupT1 =
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T1_YEARLY ) ||
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T1_MONTHLY ) ||
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY );
	const ownsBackupT2 =
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T2_YEARLY ) ||
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T2_MONTHLY );

	// If neither T0 or T1 or T2 backups are owned, then show T1 backups.
	// Otherwise the one owned will be displayed via purchasedProducts.
	if ( ! ownsBackupT0 && ! ownsBackupT1 && ! ownsBackupT2 ) {
		backupProductsToShow.push(
			PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
			PRODUCT_JETPACK_BACKUP_T1_YEARLY,
			PRODUCT_JETPACK_BACKUP_T1_MONTHLY
		);
	}

	availableProducts = [ ...availableProducts, ...backupProductsToShow ];

	// If Jetpack Backup is directly or indirectly owned, continue, otherwise make it available by displaying
	// the option cards.

	// If Jetpack Scan is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			( JETPACK_SCAN_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
		)
	) {
		availableProducts = [
			...availableProducts,
			...[ PRODUCT_JETPACK_SCAN, PRODUCT_JETPACK_SCAN_MONTHLY ],
		];
	}

	// If Jetpack Anti-spam is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			( JETPACK_ANTI_SPAM_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
		)
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_ANTI_SPAM_PRODUCTS ];
	}

	// If Jetpack VideoPress is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			( JETPACK_VIDEOPRESS_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
		)
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_VIDEOPRESS_PRODUCTS ];
	}

	// If Jetpack Boost is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			( JETPACK_BOOST_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
		)
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_BOOST_PRODUCTS ];
	}

	// If Jetpack Stats is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			( JETPACK_STATS_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
		)
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_STATS_PRODUCTS ];
	}

	if ( isEnabled( 'jetpack/social-plans-v1' ) ) {
		// If Jetpack Social is directly or indirectly owned, continue, otherwise make it available.
		if (
			! ownedProducts.some( ( ownedProduct ) =>
				( JETPACK_SOCIAL_V1_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
			)
		) {
			availableProducts = [ ...availableProducts, ...JETPACK_SOCIAL_V1_PRODUCTS ];
		}
	} else {
		const socialProductsToShow: string[] = [];

		const ownsSocialBasic =
			ownedProducts.includes( PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY ) ||
			ownedProducts.includes( PRODUCT_JETPACK_SOCIAL_BASIC ) ||
			ownedProducts.includes( PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY );
		const ownsSocialAdvanced =
			ownedProducts.includes( PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY ) ||
			ownedProducts.includes( PRODUCT_JETPACK_SOCIAL_ADVANCED ) ||
			ownedProducts.includes( PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY );

		// If neither Social Basic or Social Advanced backups are owned, then show Social Basic Plan.
		// Otherwise the one owned will be displayed via purchasedProducts.
		if ( ! ownsSocialBasic && ! ownsSocialAdvanced ) {
			socialProductsToShow.push(
				PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
				PRODUCT_JETPACK_SOCIAL_ADVANCED,
				PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY
			);
		}

		availableProducts = [ ...availableProducts, ...socialProductsToShow ];
	}

	// If the user does not own the AI product, include it in available products
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			( JETPACK_AI_PRODUCTS as ReadonlyArray< string > ).includes( ownedProduct )
		)
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_AI_PRODUCTS ];
	}

	return {
		availableProducts: availableProducts.map( slugToSelectorProduct ) as SelectorProduct[],
		purchasedProducts: purchasedProducts.map( slugToSelectorProduct ) as SelectorProduct[],
		includedInPlanProducts: includedInPlanProducts.map(
			slugToSelectorProduct
		) as SelectorProduct[],
	};
};

export default useSelectorPageProducts;
