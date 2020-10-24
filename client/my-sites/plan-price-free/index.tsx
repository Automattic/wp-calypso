/**
 * External dependencies
 */

import React, { FC } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
} from 'calypso/lib/products-values/constants';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	productSlug?: string;
}

const PlanPriceFree: FC< Props > = ( { productSlug } ) => {
	const translate = useTranslate();

	let content;
	switch ( productSlug ) {
		case PRODUCT_JETPACK_CRM:
		case PRODUCT_JETPACK_CRM_MONTHLY:
			content = translate( 'Start managing contacts now' );
			break;
		default:
			content = null;
	}

	return (
		<div className="plan-price-free">
			<h4 className="plan-price-free__main">{ translate( 'Free' ) }</h4>
			<div className="plan-price-free__content">{ content }</div>
		</div>
	);
};

export default PlanPriceFree;
