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

const JetpackFreeCardAlt: FC< JetpackFreeProps > = ( { siteId, urlQueryArgs } ) => {
	const translate = useTranslate();

	const freeFeatures = useMemo(
		() => ( {
			items: [
				translate( 'Brute force attack protection' ),
				translate( 'Site stats' ),
				translate( 'Content delivery network' ),
			].map( ( t ) => ( { text: t } ) ),
		} ),
		[ translate ]
	);

	return (
		<div className="jetpack-free-card-spp jetpack-product-card-i5" data-e2e-product-slug="free">
			<header className="jetpack-free-card-spp__header">
				<h3 className="jetpack-free-card-spp__title">{ translate( 'Jetpack Free' ) }</h3>
				<p className="jetpack-free-card-spp__subheadline">
					{ translate(
						'Power up your WordPress site with essential security and performance features.'
					) }
				</p>
				<JetpackFreeCardButton
					className="jetpack-free-card-spp__button"
					siteId={ siteId }
					urlQueryArgs={ urlQueryArgs }
				/>
			</header>
			<JetpackProductCardFeatures features={ freeFeatures } />
		</div>
	);
};

export default JetpackFreeCardAlt;
