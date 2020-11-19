/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FeaturesItem from '../jetpack-product-card-alt/features-item';
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

	const freeFeaturesOne = [
		{
			text: translate( 'Site stats' ),
		},
		{
			text: translate( 'Brute force attack protection' ),
		},
		{
			text: translate( 'Content Delivery Network' ),
		},
	];

	const freeFeaturesTwo = [
		{
			text: translate( 'Automated social media posting' ),
		},
		{
			text: translate( 'Downtime monitoring' ),
		},
		{
			text: translate( 'Activity Log' ),
		},
	];

	return (
		<div className="jetpack-free-card-alt" data-e2e-product-slug="free">
			<div className="jetpack-free-card-alt__main">
				<header>
					<h2>{ translate( 'Jetpack Free' ) }</h2>
					<div className="jetpack-free-card-alt__subheadline">
						{ translate( 'Included for free with all products' ) }
					</div>
				</header>
				<JetpackFreeCardButton primary siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
			</div>
			<div className="jetpack-free-card-alt__features">
				<ul className="jetpack-free-card-alt__features-list">
					{ freeFeaturesOne.map( ( feature, index ) => (
						<FeaturesItem key={ index } item={ feature } />
					) ) }
				</ul>
				<ul className="jetpack-free-card-alt__features-list">
					{ freeFeaturesTwo.map( ( feature, index ) => (
						<FeaturesItem key={ index } item={ feature } />
					) ) }
				</ul>
			</div>
		</div>
	);
};

export default JetpackFreeCardAlt;
