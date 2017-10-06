/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';

const PromotionFormConditionsCard = ( {
	translate,
} ) => {
	return (
		<SectionHeader label={ translate( 'Conditions' ) } className="promotions__promotion-form-conditions-header" />
	);
};

export default localize( PromotionFormConditionsCard );

