/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackCrmCard: FC = () => {
	const translate = useTranslate();

	return (
		<div className="jetpack-crm-card jetpack-product-card" data-e2e-product-slug="free">
			<header className="jetpack-crm-card__header">
				<h3 className="jetpack-crm-card__title">{ translate( 'CRM Free' ) }</h3>
				<p className="jetpack-crm-card__subheadline">
					{ translate(
						'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits.'
					) }
				</p>
				<Button
					className="jetpack-crm-card__button"
					href="https://jetpackcrm.com/pricing?utm_source=jetpack&utm_medium=web&utm_campaign=pricing_i4&utm_content=pricing"
				>
					{ translate( 'Get CRM free' ) }
				</Button>
			</header>
			<ul className="jetpack-crm-card__features-list">
				{ [
					{
						text: translate( 'Unlimited contacts' ),
					},
					{
						text: translate( 'Manage billing and create invoices' ),
					},
					{
						text: translate( 'Fully integrated with WordPress' ),
					},
				].map( ( feature, index ) => (
					<li key={ index }>{ feature.text }</li>
				) ) }
			</ul>
		</div>
	);
};

export default JetpackCrmCard;
