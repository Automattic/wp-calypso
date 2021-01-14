/**
 * External dependencies
 */
import React, { FC, useMemo } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackProductCardFeatures from 'calypso/components/jetpack/card/jetpack-product-card-i5/features';
import JetpackFreeCardButton from 'calypso/components/jetpack/card/jetpack-free-card-button';

/**
 * Type dependencies
 */
import type { JetpackFreeProps } from 'calypso/my-sites/plans/jetpack-plans/types';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackCrmFreeCardSPP: FC< JetpackFreeProps > = ( { siteId, urlQueryArgs } ) => {
	const translate = useTranslate();

	const crmFreeFeatures = useMemo(
		() => ( {
			items: [
				translate( 'Unlimited contacts' ),
				translate( 'Manage billing and create invoices' ),
				translate( 'CRM fully integrated with WordPress' ),
			].map( ( t ) => ( {
				text: t,
			} ) ),
		} ),
		[ translate ]
	);

	return (
		<div
			className="jetpack-crm-free-card-spp jetpack-product-card-i5"
			data-e2e-product-slug="crm-free"
		>
			<header className="jetpack-crm-free-card-spp__header">
				<h3 className="jetpack-crm-free-card-spp__title">{ translate( 'Jetpack CRM Free' ) }</h3>
				<p className="jetpack-crm-free-card-spp__subheadline">
					{ translate( 'Build better relationships with your customers and clients.' ) }
				</p>
				<JetpackFreeCardButton
					className="jetpack-crm-free-card-spp__button"
					siteId={ siteId }
					urlQueryArgs={ urlQueryArgs }
				/>
			</header>
			<JetpackProductCardFeatures features={ crmFreeFeatures } />
		</div>
	);
};

export default JetpackCrmFreeCardSPP;
