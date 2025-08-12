import {
	planHasFeature,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_PREMIUM_SUPPORT,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_WORDADS_INSTANT,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';

/*
 * Show a list of Jetpack benefits that do not depend on site data
 * These can vary by plan, but we do not need to get any data about the site to show these
 * This is similar to the disconnection flow where some plan benefits are listed if a user is disconnecting Jetpack
 */

interface Props {
	productSlug: string;
}

const JetpackGeneralBenefits: React.FC< Props > = ( { productSlug } ) => {
	const translate = useTranslate();
	const benefits = [];

	// Priority Support
	if ( planHasFeature( productSlug, FEATURE_PREMIUM_SUPPORT ) ) {
		benefits.push(
			<React.Fragment>
				{ translate(
					"{{strong}}Priority support{{/strong}} from Jetpack's WordPress and security experts.",
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</React.Fragment>
		);
	}

	// Payment Collection
	if ( planHasFeature( productSlug, FEATURE_SIMPLE_PAYMENTS ) ) {
		benefits.push(
			<React.Fragment>
				{ translate( 'The ability to {{strong}}collect payments{{/strong}}.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}

	// Ad Program
	if ( planHasFeature( productSlug, FEATURE_WORDADS_INSTANT ) ) {
		benefits.push(
			<React.Fragment>
				{ translate( 'The {{strong}}Ad program{{/strong}} for WordPress.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}

	// 1TB of Video Hosting
	if ( planHasFeature( productSlug, FEATURE_JETPACK_VIDEOPRESS ) ) {
		benefits.push(
			<React.Fragment>
				{ translate( 'Up to 1TB of {{strong}}high-speed video hosting{{/strong}}.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}
	// 13GB of Video Hosting
	else if ( planHasFeature( productSlug, FEATURE_VIDEO_UPLOADS_JETPACK_PRO ) ) {
		benefits.push(
			<React.Fragment>
				{ translate( 'Up to 13GB of {{strong}}high-speed video hosting{{/strong}}.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}

	// General benefits of all Jetpack Plans (brute force protection, CDN)
	benefits.push(
		<React.Fragment>
			{ translate(
				'Brute force {{strong}}attack protection{{/strong}} and {{strong}}downtime monitoring{{/strong}}.',
				{
					components: {
						strong: <strong />,
					},
				}
			) }
		</React.Fragment>
	);

	return (
		<ul className="jetpack-benefits__general-benefit-list">
			{ benefits.map( ( benefit, idx ) => {
				return <li key={ idx }>{ benefit }</li>;
			} ) }
		</ul>
	);
};

export default JetpackGeneralBenefits;
