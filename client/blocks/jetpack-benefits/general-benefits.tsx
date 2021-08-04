/**
 * External Dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import {
	isBusinessPlan,
	isCompletePlan,
	isJetpackPlanSlug,
	isPersonalPlan,
	isPremiumPlan,
	isSecurityDailyPlan,
	isSecurityRealTimePlan,
} from '@automattic/calypso-products';

/**
 * Internal Dependencies
 */

/*
 * Show a list of Jetpack benefits that do not depend on site data
 * These can vary by plan, but we do not need to get any data about the site to show these
 * This is similar to the disconnection flow where some plan benefits are listed if a user is disconnecting Jetpack
 */

interface Props {
	productSlug: string;
}

const JetpackGeneralBenefits: React.FC< Props > = ( props ) => {
	const translate = useTranslate();
	const { productSlug } = props;
	const benefits = [];

	// Priority Support
	if (
		isSecurityDailyPlan( productSlug ) ||
		isSecurityRealTimePlan( productSlug ) ||
		isCompletePlan( productSlug ) ||
		isPersonalPlan( productSlug ) ||
		isPremiumPlan( productSlug ) ||
		isBusinessPlan( productSlug )
	) {
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
	// Ad Program
	// Google Analytics
	if (
		isSecurityDailyPlan( productSlug ) ||
		isSecurityRealTimePlan( productSlug ) ||
		isCompletePlan( productSlug ) ||
		isPremiumPlan( productSlug ) ||
		isBusinessPlan( productSlug )
	) {
		benefits.push(
			<React.Fragment>
				{ translate( 'Ability to {{strong}}collect payments{{/strong}}.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
		benefits.push(
			<React.Fragment>
				{ translate( 'The {{strong}}Ad program{{/strong}} for WordPress.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
		benefits.push(
			<React.Fragment>
				{ translate( 'The {{strong}}Google Analytics{{/strong}} integration.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}

	// 13GB of video hosting
	if ( isPremiumPlan( productSlug ) || isSecurityDailyPlan( productSlug ) ) {
		benefits.push(
			<React.Fragment>
				{ translate( 'Up to 13GB of {{strong}}high-speed-video hosting{{/strong}}.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}

	// Unlimited Video Hosting
	if (
		isBusinessPlan( productSlug ) ||
		isSecurityRealTimePlan( productSlug ) ||
		isCompletePlan( productSlug )
	) {
		benefits.push(
			<React.Fragment>
				{ translate( 'Unlimited {{strong}}high-speed-video hosting{{/strong}}.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}

	// General benefits of all Jetpack Plans (brute force protection, CDN)
	if ( isJetpackPlanSlug( productSlug ) ) {
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
		benefits.push(
			<React.Fragment>
				{ translate( 'Unlimited {{strong}}high-speed image{{/strong}} hosting.', {
					components: {
						strong: <strong />,
					},
				} ) }
			</React.Fragment>
		);
	}

	if ( benefits.length > 0 ) {
		return (
			<ul className="jetpack-benefits__general-benefit-list">
				{ benefits.map( ( benefit, idx ) => {
					return <li key={ idx }>{ benefit }</li>;
				} ) }
			</ul>
		);
	}

	return null;
};

export default JetpackGeneralBenefits;
