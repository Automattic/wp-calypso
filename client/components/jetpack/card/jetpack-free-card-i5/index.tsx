/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
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

const JetpackFreeCardAlt: React.FC< JetpackFreeProps > = ( { siteId, urlQueryArgs } ) => {
	const translate = useTranslate();
	const wpAdminUrl = useSelector( getJetpackWpAdminUrl );
	const onClickTrack = useTrackCallback( undefined, 'calypso_product_jpfree_click', {
		site_id: siteId || undefined,
	} );
	const startHref = isJetpackCloud()
		? addQueryArgs( urlQueryArgs, `https://wordpress.com${ JPC_PATH_REMOTE_INSTALL }` )
		: wpAdminUrl || JPC_PATH_REMOTE_INSTALL;

	return (
		<div className="jetpack-free-card-i5 jetpack-product-card-i5" data-e2e-product-slug="free">
			<header className="jetpack-free-card-i5__header">
				<h3 className="jetpack-free-card-i5__title">{ translate( 'Jetpack Free' ) }</h3>
				<p className="jetpack-free-card-i5__subheadline">
					{ translate( 'Included for free with all products' ) }
				</p>
				<Button
					className="jetpack-free-card-i5__button"
					href={ startHref }
					onClick={ onClickTrack }
				>
					{ translate( 'Start for free' ) }
				</Button>
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
