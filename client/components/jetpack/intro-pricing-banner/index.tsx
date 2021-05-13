/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';

import badgeIcon from './guarantee.svg';
import './style.scss';

const Banner: React.FC = () => {
	const translate = useTranslate();

	return (
		<div className="intro-pricing-banner">
			<div className="intro-pricing-banner__copy">
				<p className="intro-pricing-banner__header">
					{ preventWidows( translate( 'Check out our new introductory pricing' ) ) }
				</p>
				<p className="intro-pricing-banner__call-to-action">
					{ translate(
						'Get the perfect Jetpack for your site with %(percent)d%% off the first term. *Try it risk free with our %(days)d-day money-back guarantee.',
						{
							args: { percent: INTRO_PRICING_DISCOUNT_PERCENTAGE, days: 14 },
						}
					) }
				</p>
			</div>

			<img
				className="intro-pricing-banner__badge"
				alt={ translate( 'Money Back %(days)d-Day Guarantee', { args: { days: 14 } } ) }
				src={ badgeIcon }
			/>
		</div>
	);
};

export default Banner;
