/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import JetpackFreeCardButton from 'calypso/components/jetpack/card/jetpack-free-card-button';

/**
 * Type dependencies
 */
import type { JetpackFreeProps } from 'calypso/my-sites/plans/jetpack-plans/types';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFreeCardAlt: FC< JetpackFreeProps > = ( { siteId, urlQueryArgs } ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-free-card-i5 jetpack-product-card-i5" data-e2e-product-slug="free">
			<header className="jetpack-free-card-i5__header">
				<h3 className="jetpack-free-card-i5__title">{ translate( 'Jetpack Free' ) }</h3>
				<p className="jetpack-free-card-i5__subheadline">
					{ translate( 'Included for free with all products' ) }
				</p>
				<JetpackFreeCardButton
					className="jetpack-free-card-i5__button"
					siteId={ siteId }
					urlQueryArgs={ urlQueryArgs }
				/>
			</header>
			<ul className="jetpack-free-card-i5__features-list">
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
					<li key={ index }>
						<Gridicon icon="checkmark" />
						<span className="jetpack-free-card-i5__features-text">{ feature.text }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default JetpackFreeCardAlt;
