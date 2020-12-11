/**
 * External dependencies
 */
import classNames from 'classnames';
import { sortBy } from 'lodash';
import React, { useMemo, useRef, useState, RefObject } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import ProductCardI5 from '../../product-card-i5';
import { getProductPosition } from '../../product-grid/products-order';
import { getPlansToDisplay } from '../../product-grid/utils';
import {
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from 'calypso/lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

/**
 * Type dependencies
 */
import type { ProductsGridProps } from '../../types';
import type { JetpackPlanSlugs } from 'calypso/lib/plans/types';

/**
 * Style dependencies
 */
import './style.scss';

export const ProductsGrid: React.FC< ProductsGridProps > = ( { duration, onSelectProduct } ) => {
	const planGridRef: RefObject< HTMLUListElement > = useRef( null );
	const [ isPlanRowWrapping ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	const sortedPlans = useMemo(
		() =>
			sortBy( getPlansToDisplay( { duration, currentPlanSlug } ), ( item ) =>
				getProductPosition( item.productSlug as JetpackPlanSlugs )
			),
		[ duration, currentPlanSlug ]
	);

	return (
		<section className="products-grid-i6__section">
			<h2 className="products-grid-i6__section-title">Best iteration ever</h2>
			<ul
				className={ classNames( 'products-grid-i6__plan-grid', {
					'is-wrapping': isPlanRowWrapping,
				} ) }
				ref={ planGridRef }
			>
				{ sortedPlans.map( ( product ) => (
					<li key={ product.iconSlug }>
						<ProductCardI5
							item={ product }
							onClick={ onSelectProduct }
							siteId={ siteId }
							currencyCode={ currencyCode }
							selectedTerm={ duration }
							isAligned={ ! isPlanRowWrapping }
							featuredPlans={ [
								PLAN_JETPACK_SECURITY_REALTIME,
								PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
							] }
						/>
					</li>
				) ) }
			</ul>
		</section>
	);
};
