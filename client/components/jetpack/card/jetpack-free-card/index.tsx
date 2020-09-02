/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	buttonUrl: string;
};

const JetpackFreeCard: FunctionComponent< Props > = ( { buttonUrl } ) => {
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
								a: <a href="https://jetpack.com/features/comparison/" />,
							},
						}
					) }
				</p>
				{ buttonUrl && (
					<Button className="jetpack-free-card__button" href={ buttonUrl } type="button">
						{ translate( 'Start for free' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export default JetpackFreeCard;
