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
import { JPC_PATH_REMOTE_INSTALL } from 'calypso/jetpack-connect/constants';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import getJetpackWpAdminUrl from 'calypso/state/selectors/get-jetpack-wp-admin-url';
import { addQueryArgs } from 'calypso/lib/route';

/**
 * Type dependencies
 */
import type { JetpackFreeProps } from 'calypso/my-sites/plans-v2/types';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFreeCard = ( { siteId, urlQueryArgs }: JetpackFreeProps ) => {
	const translate = useTranslate();
	const wpAdminUrl = useSelector( getJetpackWpAdminUrl );

	const startHref = isJetpackCloud()
		? addQueryArgs( urlQueryArgs, `https://wordpress.com${ JPC_PATH_REMOTE_INSTALL }` )
		: wpAdminUrl || JPC_PATH_REMOTE_INSTALL;

	const onClickTrack = useTrackCallback( undefined, 'calypso_product_jpfree_click', {
		site_id: siteId || undefined,
	} );

	return (
		<div className="jetpack-free-card" data-e2e-product-slug="free">
			<header className="jetpack-free-card__header">
				<h3>{ translate( 'Jetpack Free' ) }</h3>
			</header>
			<div className="jetpack-free-card__body">
				<p>
					{ translate(
						'Jetpack has many free features that are essential for every WordPress site. Get site stats, automated social media posting, downtime monitoring, brute force attack protection, activity log, & CDN (Content Delivery Network). {{a}}Learn more{{/a}}',
						{
							components: {
								a: <a href="https://jetpack.com/features/comparison/" />,
							},
						}
					) }
				</p>
				<Button className="jetpack-free-card__button" href={ startHref } onClick={ onClickTrack }>
					{ translate( 'Start for free' ) }
				</Button>
			</div>
		</div>
	);
};

export default JetpackFreeCard;
