/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackFreeCardButton from './button';

/**
 * Type dependencies
 */
import type { JetpackFreeProps } from 'calypso/my-sites/plans/jetpack-plans/types';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFreeCard: FC< JetpackFreeProps > = ( { siteId, urlQueryArgs } ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-free-card jetpack-product-card" data-e2e-product-slug="free">
			<header className="jetpack-free-card__header">
				<h3 className="jetpack-free-card__title">{ translate( 'Jetpack Free' ) }</h3>
				<p className="jetpack-free-card__subheadline">
					{ translate( 'Included for free with all products' ) }
				</p>
				<JetpackFreeCardButton
					className="jetpack-free-card__button"
					siteId={ siteId }
					urlQueryArgs={ urlQueryArgs }
				/>
			</header>
			<ul className="jetpack-free-card__features-list">
				{ [
					{
						text: translate( 'Site stats' ),
					},
					{
						text: translate( 'Brute force attack protection' ),
					},
					{
						text: translate( 'Content Delivery Network' ),
					},
					{
						text: translate( 'Automated social media posting' ),
					},
					{
						text: translate( 'Downtime monitoring' ),
					},
					{
						text: translate( 'Activity Log' ),
					},
				].map( ( feature, index ) => (
					<li key={ index }>{ feature.text }</li>
				) ) }
			</ul>
		</div>
	);
};

export default JetpackFreeCard;
