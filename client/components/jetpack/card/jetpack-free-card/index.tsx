/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import { JPC_PATH_REMOTE_INSTALL } from 'jetpack-connect/constants';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import getJetpackWpAdminUrl from 'state/selectors/get-jetpack-wp-admin-url';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFreeCard: FunctionComponent = () => {
	const translate = useTranslate();
	const wpAdminUrl = useSelector( getJetpackWpAdminUrl );

	const startHref = isJetpackCloud()
		? `https://wordpress.com${ JPC_PATH_REMOTE_INSTALL }`
		: wpAdminUrl || JPC_PATH_REMOTE_INSTALL;

	return (
		<div className="jetpack-free-card">
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
				<Button className="jetpack-free-card__button" href={ startHref }>
					{ translate( 'Start for free' ) }
				</Button>
			</div>
		</div>
	);
};

export default JetpackFreeCard;
