/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFreeCard: FunctionComponent = () => {
	const translate = useTranslate();

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
								a: <ExternalLink icon={ true } href="https://jetpack.com/features/comparison/" />,
							},
						}
					) }
				</p>
				<Button>{ translate( 'Start for free' ) }</Button>
			</div>
		</div>
	);
};

export default JetpackFreeCard;
