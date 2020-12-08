/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FeaturesItem from '../jetpack-product-card-alt/features-item';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { addQueryArgs } from 'calypso/lib/route';
import getJetpackWpAdminUrl from 'calypso/state/selectors/get-jetpack-wp-admin-url';
import { JPC_PATH_REMOTE_INSTALL } from 'calypso/jetpack-connect/constants';

/**
 * Type dependencies
 */
import type { JetpackFreeProps } from 'calypso/my-sites/plans-v2/types';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFreeCardAlt = ( { siteId, urlQueryArgs }: JetpackFreeProps ) => {
	const translate = useTranslate();
	const wpAdminUrl = useSelector( getJetpackWpAdminUrl );

	const startHref = isJetpackCloud()
		? addQueryArgs( urlQueryArgs, `https://wordpress.com${ JPC_PATH_REMOTE_INSTALL }` )
		: wpAdminUrl || JPC_PATH_REMOTE_INSTALL;

	const onClickTrack = useTrackCallback( undefined, 'calypso_product_jpfree_click', {
		site_id: siteId || undefined,
	} );

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
				<Button primary href={ startHref } onClick={ onClickTrack }>
					{ translate( 'Start for free' ) }
				</Button>
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
