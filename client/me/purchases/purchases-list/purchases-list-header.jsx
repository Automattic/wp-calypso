/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { CompactCard } from '@automattic/components';

/**
 * Style dependencies
 */
import 'calypso/me/purchases/style.scss';

const PurchasesListHeader = ( { showSite = false } ) => {
	const translate = useTranslate();

	return (
		<CompactCard className="purchases-list-header purchases-layout__wrapper">
			{ showSite && (
				<div className="purchases-list-header__title purchases-layout__site">
					{ translate( 'Site' ) }
				</div>
			) }
			<div className="purchases-list-header__title purchases-layout__information">
				{ translate( 'Product' ) }
			</div>
			<div className="purchases-list-header__title purchases-layout__status">
				{ translate( 'Status' ) }
			</div>
			<div className="purchases-list-header__title purchases-layout__payment-method">
				{ translate( 'Payment method' ) }
			</div>
		</CompactCard>
	);
};

export default PurchasesListHeader;
