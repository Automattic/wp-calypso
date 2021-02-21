/**
 * External dependencies
 */
import classnames from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackProductCardFeatures from 'calypso/components/jetpack/card/i5/jetpack-product-card-i5/features';
import JetpackFreeCardButton from 'calypso/components/jetpack/card/jetpack-free-card-button';

/**
 * Style dependencies
 */
import './style.scss';

type JetpackCrmFreeProps = {
	className?: string;
	urlQueryArgs: QueryArgs;
	siteId: number | null;
};

const JetpackCrmFreeCardSPP: FC< JetpackCrmFreeProps > = ( {
	className,
	siteId,
	urlQueryArgs,
} ) => {
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
			className={ classnames( className, 'jetpack-crm-free-card-spp', 'jetpack-product-card-i5' ) }
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
			<JetpackProductCardFeatures
				className="jetpack-crm-free-card-spp__features"
				features={ crmFreeFeatures }
			/>
		</div>
	);
};

export default JetpackCrmFreeCardSPP;
